import uvicorn
import logging
import multiprocessing

# Set multiprocessing start method
if __name__ == "__main__":
    try:
        multiprocessing.set_start_method('spawn')
    except RuntimeError:
        pass  # Method already set

    logging.basicConfig(level=logging.DEBUG)

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=3003,
        reload=True,
        log_level="debug"
    ) 