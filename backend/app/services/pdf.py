from typing import Dict, Tuple, Optional, List
from fastapi import HTTPException, status
import logging
from pathlib import Path
import tempfile
import fitz  # PyMuPDF
import os
import time
from math import ceil

# Configure logging
logger = logging.getLogger(__name__)

class PDFService:
    """Service for handling PDF processing and conversion."""
    
    @staticmethod
    def calculate_bold_length(word: str) -> int:
        """Calculate how many characters should be bold based on word length."""
        return len(word) // 2
    
    @staticmethod
    def get_element_bbox(element: Dict) -> fitz.Rect:
        """Get the bounding box of an element."""
        if "bbox" in element:
            return fitz.Rect(element["bbox"])
        return None
        
    @staticmethod
    def is_overlapping(rect1: fitz.Rect, rect2: fitz.Rect, threshold: float = 1.0) -> bool:
        """Check if two rectangles overlap with a threshold."""
        if not (rect1 and rect2):
            return False
        return rect1.intersects(rect2.inflate(threshold))
        
    @staticmethod
    def process_table(page: fitz.Page, table_block: Dict) -> List[Dict]:
        """Process a table block and return its cells as structured data."""
        try:
            # Extract table structure using PyMuPDF's built-in table detection
            table = page.find_tables(table_settings={
                "vertical_strategy": "lines",
                "horizontal_strategy": "lines",
                "snap_tolerance": 3,
                "join_tolerance": 3,
                "edge_min_length": 3
            })
            
            if table and len(table) > 0:
                return table[0].extract()
            return []
        except Exception as e:
            logger.warning(f"Error processing table: {str(e)}")
            return []
            
    @staticmethod
    def process_list(blocks: List[Dict], current_block_index: int) -> Tuple[List[Dict], int]:
        """Process list items and return structured list data."""
        list_items = []
        i = current_block_index
        
        while i < len(blocks):
            block = blocks[i]
            if not block.get("lines"):
                break
                
            first_line = block["lines"][0]
            if not first_line.get("spans"):
                break
                
            first_span = first_line["spans"][0]
            text = first_span.get("text", "").strip()
            
            # Check for common list markers
            if text.startswith(("•", "-", "*", "○", "▪", "1.", "a.", "A.")):
                list_items.append(block)
                i += 1
            else:
                break
                
        return list_items, i - current_block_index
        
    @staticmethod
    def process_header_footer(page: fitz.Page, block: Dict) -> bool:
        """Determine if a block is a header or footer."""
        bbox = PDFService.get_element_bbox(block)
        if not bbox:
            return False
            
        # Check if block is at top or bottom of page
        page_height = page.rect.height
        margin = 72  # 1 inch margin
        
        is_header = bbox.y0 < margin
        is_footer = bbox.y1 > (page_height - margin)
        
        return is_header or is_footer
        
    @staticmethod
    def handle_complex_formatting(span: Dict) -> Dict:
        """Handle complex text formatting attributes."""
        formatting = {
            "is_bold": span.get("font", "").lower().find("bold") >= 0,
            "is_italic": span.get("font", "").lower().find("italic") >= 0,
            "is_underline": span.get("flags", 0) & 4 > 0,
            "size": span.get("size", 12),
            "color": span.get("color", (0, 0, 0)),
            "font": span.get("font", "Helvetica")
        }
        return formatting

    @staticmethod
    async def convert_to_bionic(content: bytes, filename: str) -> bytes:
        """Convert a PDF file to bionic reading format."""
        logger.debug(f"Starting conversion of file: {filename}")
        
        if not content.startswith(b'%PDF'):
            logger.error("Invalid PDF format - file does not start with %PDF")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PDF file format"
            )
        
        with tempfile.TemporaryDirectory() as temp_dir:
            logger.debug(f"Created temp directory: {temp_dir}")
            input_path = Path(temp_dir) / filename
            output_path = Path(temp_dir) / "output.pdf"
            
            try:
                input_path.write_bytes(content)
                doc = fitz.open(input_path)
                output_doc = fitz.open()
                
                # Copy fonts from original document to new document
                for xref in range(1, doc.xref_length()):
                    if doc.xref_is_font(xref):
                        output_doc._copy_resources(doc, xref)
                
                # Track elements across pages for consistency
                processed_elements = []
                
                for page_num, page in enumerate(doc):
                    logger.debug(f"Processing page {page_num + 1}/{len(doc)}")
                    new_page = output_doc.new_page(width=page.rect.width, height=page.rect.height)
                    
                    # Get page structure with all text flags
                    page_dict = page.get_text("dict", flags=fitz.TEXTFLAGS_TEXT | fitz.TEXTFLAGS_BLOCKS | fitz.TEXTFLAGS_HTML)
                    blocks = page_dict["blocks"]
                    
                    # Debug logging for text extraction
                    logger.debug(f"Page {page_num + 1} - Total blocks: {len(blocks)}")
                    text_blocks = [b for b in blocks if b.get("type") == 0]
                    logger.debug(f"Page {page_num + 1} - Text blocks: {len(text_blocks)}")
                    
                    # First pass: Analyze and categorize elements
                    page_elements = []
                    for block in blocks:
                        block_type = block.get("type", 0)
                        bbox = PDFService.get_element_bbox(block)
                        
                        if block_type == 0:  # Text block
                            if PDFService.process_header_footer(page, block):
                                element_type = "header_footer"
                            elif any(PDFService.is_overlapping(bbox, elem["bbox"]) for elem in processed_elements):
                                continue  # Skip overlapping elements
                            else:
                                # Check for lists
                                list_items, count = PDFService.process_list(blocks, len(page_elements))
                                if list_items:
                                    element_type = "list"
                                    block["list_items"] = list_items
                                else:
                                    element_type = "text"
                                    
                        elif block_type == 1:  # Image block
                            element_type = "image"
                        else:
                            # Try to detect tables
                            table_data = PDFService.process_table(page, block)
                            if table_data:
                                element_type = "table"
                                block["table_data"] = table_data
                            else:
                                element_type = "other"
                                
                        page_elements.append({
                            "type": element_type,
                            "block": block,
                            "bbox": bbox
                        })
                    
                    # Second pass: Process and render elements
                    for element in page_elements:
                        try:
                            if element["type"] == "text":
                                # Process text with bionic reading
                                block = element["block"]
                                for line in block["lines"]:
                                    if not line.get("spans"):
                                        continue
                                    
                                    for span in line["spans"]:
                                        if not span.get("text"):
                                            continue
                                            
                                        # Get original text properties
                                        text = span["text"]
                                        fontsize = span.get("size", 11)
                                        color = span.get("color", (0, 0, 0))
                                        origin = span["origin"]
                                        
                                        # Split into words for bionic reading
                                        words = text.split()
                                        current_x = origin[0]
                                        
                                        for word in words:
                                            if not word:
                                                continue
                                                
                                            # Calculate bold part length
                                            bold_length = len(word) // 2
                                            bold_part = word[:bold_length]
                                            regular_part = word[bold_length:]
                                            
                                            try:
                                                # Insert bold part with built-in Helvetica font
                                                if bold_part:
                                                    logger.debug(f"Attempting to render bold text: {bold_part} at position ({current_x}, {origin[1]})")
                                                    new_page.insert_text(
                                                        (current_x, origin[1]),
                                                        bold_part,
                                                        fontname="helv-Bold",  # Always use built-in Helvetica Bold
                                                        fontsize=fontsize,
                                                        color=color
                                                    )
                                                    logger.debug("Successfully rendered bold part")
                                                    current_x += new_page.get_text_length(bold_part, fontname="helv-Bold", fontsize=fontsize)
                                                
                                                # Insert regular part with built-in Helvetica font
                                                if regular_part:
                                                    logger.debug(f"Attempting to render regular text: {regular_part} at position ({current_x}, {origin[1]})")
                                                    new_page.insert_text(
                                                        (current_x, origin[1]),
                                                        regular_part,
                                                        fontname="helv",  # Always use built-in Helvetica
                                                        fontsize=fontsize,
                                                        color=color
                                                    )
                                                    logger.debug("Successfully rendered regular part")
                                                    current_x += new_page.get_text_length(regular_part, fontname="helv", fontsize=fontsize)
                                                
                                                # Add word spacing
                                                current_x += fontsize * 0.2
                                                
                                            except Exception as e:
                                                logger.error(f"Failed to insert text: {str(e)}")
                                                # No need for fallback since we're already using built-in fonts
                                            
                            elif element["type"] == "image":
                                # Handle images
                                block = element["block"]
                                xref = block.get("xref")
                                if xref:
                                    image_info = doc.extract_image(xref)
                                    if image_info:
                                        new_page.insert_image(
                                            element["bbox"],
                                            stream=image_info["image"],
                                            mask=image_info.get("mask"),
                                            filename=image_info.get("name", "")
                                        )
                                        processed_elements.append(element)
                                        
                            elif element["type"] == "table":
                                # Render tables with preserved structure
                                table_data = element["block"].get("table_data", [])
                                if table_data:
                                    # Draw table grid
                                    bbox = element["bbox"]
                                    new_page.draw_rect(bbox)
                                    
                                    # Draw cells
                                    for row in table_data:
                                        for cell in row:
                                            cell_rect = fitz.Rect(cell["bbox"])
                                            new_page.draw_rect(cell_rect)
                                            
                                            # Apply bionic reading to cell text
                                            if cell.get("text"):
                                                words = cell["text"].split()
                                                current_x = cell_rect.x0 + 2
                                                y0 = cell_rect.y0 + 2
                                                
                                                for word in words:
                                                    if not word:
                                                        continue
                                                    
                                                    bold_length = PDFService.calculate_bold_length(word)
                                                    bold_part = word[:bold_length]
                                                    regular_part = word[bold_length:]
                                                    
                                                    if bold_part:
                                                        new_page.insert_text(
                                                            (current_x, y0),
                                                            bold_part,
                                                            fontname="Helvetica-Bold",
                                                            fontsize=8
                                                        )
                                                        current_x += PDFService.estimate_word_width(bold_part, 8, True)
                                                    
                                                    if regular_part:
                                                        new_page.insert_text(
                                                            (current_x, y0),
                                                            regular_part,
                                                            fontname="Helvetica",
                                                            fontsize=8
                                                        )
                                                        current_x += PDFService.estimate_word_width(regular_part, 8, False)
                                                    
                                                    current_x += 4
                                    
                                    processed_elements.append(element)
                                    
                            elif element["type"] == "list":
                                # Handle lists with proper indentation and markers
                                list_items = element["block"].get("list_items", [])
                                y0 = element["bbox"].y0
                                indent = 20
                                
                                for item in list_items:
                                    if item.get("lines"):
                                        line = item["lines"][0]
                                        if line.get("spans"):
                                            span = line["spans"][0]
                                            text = span["text"].strip()
                                            
                                            # Draw list marker
                                            new_page.insert_text(
                                                (element["bbox"].x0, y0),
                                                "•",
                                                fontname="Helvetica",
                                                fontsize=span.get("size", 12)
                                            )
                                            
                                            # Process list item text with bionic reading
                                            current_x = element["bbox"].x0 + indent
                                            words = text.split()
                                            
                                            for word in words:
                                                if not word:
                                                    continue
                                                
                                                bold_length = PDFService.calculate_bold_length(word)
                                                bold_part = word[:bold_length]
                                                regular_part = word[bold_length:]
                                                
                                                if bold_part:
                                                    new_page.insert_text(
                                                        (current_x, y0),
                                                        bold_part,
                                                        fontname="Helvetica-Bold",
                                                        fontsize=span.get("size", 12)
                                                    )
                                                    current_x += PDFService.estimate_word_width(
                                                        bold_part,
                                                        span.get("size", 12),
                                                        True
                                                    )
                                                
                                                if regular_part:
                                                    new_page.insert_text(
                                                        (current_x, y0),
                                                        regular_part,
                                                        fontname="Helvetica",
                                                        fontsize=span.get("size", 12)
                                                    )
                                                    current_x += PDFService.estimate_word_width(
                                                        regular_part,
                                                        span.get("size", 12),
                                                        False
                                                    )
                                                
                                                current_x += span.get("size", 12) * 0.3
                                            
                                            y0 += span.get("size", 12) * 1.5
                                            
                            elif element["type"] == "header_footer":
                                # Preserve headers and footers without bionic reading
                                block = element["block"]
                                for line in block["lines"]:
                                    for span in line["spans"]:
                                        new_page.insert_text(
                                            span["origin"],
                                            span["text"],
                                            fontname=span.get("font", "Helvetica"),
                                            fontsize=span.get("size", 12),
                                            color=span.get("color", (0, 0, 0))
                                        )
                                processed_elements.append(element)
                                
                        except Exception as e:
                            logger.warning(f"Error processing element: {str(e)}")
                            continue
                
                # Save the processed PDF
                output_doc.save(output_path, garbage=4, deflate=True)
                processed_content = output_path.read_bytes()
                return processed_content
                
            except Exception as e:
                logger.error(f"Error processing PDF: {str(e)}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error processing PDF: {str(e)}"
                )
            finally:
                if 'doc' in locals():
                    doc.close()
                if 'output_doc' in locals():
                    output_doc.close()

pdf_service = PDFService()