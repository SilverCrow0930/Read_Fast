import { useState, useEffect } from 'react'
import { useSession } from '@supabase/auth-helpers-react'
import { supabase } from '../lib/supabase'

interface BaseComment {
  id: string;
  content: string;
  created_at?: string;
  likes: number;
  user_id?: string;
  user: {
    email: string;
    name?: string;
    avatar?: string;
  };
}

interface Comment extends BaseComment {
  replies: BaseComment[];
}

interface SupabaseUser {
  email: string;
  raw_user_meta_data: {
    full_name?: string;
    avatar_url?: string;
    picture?: string;
  };
}

interface SupabaseComment {
  id: string;
  content: string;
  created_at: string;
  likes: number;
  user_id: string;
  user: SupabaseUser[];
  replies?: SupabaseComment[];
}

const INITIAL_COMMENTS: Comment[] = [
  {
    id: '1',
    content: "Just discovered the batch processing feature - absolute game changer! Converted my entire research library in minutes. Anyone else using this for academic papers? 🚀",
    user: { 
      email: "researcher_sarah",
      name: "Sarah Mitchell",
      avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150"
    },
    likes: 94,
    replies: [
      {
        id: '1-1',
        content: "Same here! Pro tip: You can also use keyboard shortcuts (Ctrl+B) to quickly process multiple files",
        user: { 
          email: "tech_dave",
          name: "David Chen",
          avatar: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=150"
        },
        likes: 45
      }
    ]
  },
  {
    id: '2',
    content: "Quick question: Is there a way to customize the bionic reading settings? Like adjusting the boldness or which parts of words get highlighted? 🤔",
    user: { 
      email: "curious_reader",
      name: "Emma Thompson",
      avatar: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=150"
    },
    likes: 89,
    replies: []
  },
  {
    id: '3',
    content: "The new update is fire 🔥 Reading speed improved by 40% for real. My ADHD brain is thankful lol",
    user: { 
      email: "speedreader_42",
      name: "Alex Turner",
      avatar: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=150"
    },
    likes: 88
  },
  {
    id: '4',
    content: "Anyone else notice how much better the PDF formatting is compared to other tools? Finally something that doesn't mess up my equations and diagrams!",
    user: { 
      email: "math_enthusiast",
      name: "Dr. James Liu",
      avatar: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=150"
    },
    likes: 82
  },
  {
    id: '5',
    content: "Pro tip: If you're using this for studying, combine it with the Pomodoro technique. 25 mins of bionic reading + 5 min break = god tier productivity",
    user: { 
      email: "productivity_ninja",
      name: "Sofia Martinez",
      avatar: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150"
    },
    likes: 79,
    replies: []
  },
  {
    id: '6',
    content: "Can we talk about how smooth the mobile sync is? Started reading on desktop, continued on phone during commute. Zero hiccups 👌",
    user: { 
      email: "tech_nomad",
      name: "Nina Patel",
      avatar: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150"
    },
    likes: 76
  },
  {
    id: '7',
    content: "Unpopular opinion: The free tier is actually more than enough for casual users. Been using it for 3 months, no complaints",
    user: { 
      email: "honest_reviewer",
      name: "Chris Anderson",
      avatar: "https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=150"
    },
    likes: 72
  },
  {
    id: '8',
    content: "Feature request: Dark mode for the reader? My eyes would appreciate it for late night reading sessions 👀",
    user: { 
      email: "night_owl",
      name: "Rachel Kim",
      avatar: "https://images.unsplash.com/photo-1502657877623-f66bf489d236?w=150"
    },
    likes: 68,
    replies: []
  },
  {
    id: '9',
    content: "The language support is insane. Just processed a German academic paper, worked perfectly with umlauts and everything",
    user: { 
      email: "polyglot_reader",
      name: "Anna Schmidt",
      avatar: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=150"
    },
    likes: 65
  },
  {
    id: '10',
    content: "PSA: You can drag and drop multiple files at once! Just found this out after manually uploading files one by one for weeks 😅",
    user: { 
      email: "late_discoverer",
      name: "Ryan O'Connor",
      avatar: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=150"
    },
    likes: 63
  },
  {
    id: '11',
    content: "Anyone else using this for coding documentation? The syntax highlighting in converted files is *chef's kiss*",
    user: { 
      email: "code_wizard",
      name: "Liam Zhang",
      avatar: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=150"
    },
    likes: 61
  },
  {
    id: '12',
    content: "TIL you can export your reading stats. Pretty cool seeing how much faster I'm reading now compared to when I started!",
    user: { 
      email: "data_nerd",
      name: "Maya Patel",
      avatar: "https://images.unsplash.com/photo-1551808525-51a94da548ce?w=150"
    },
    likes: 58
  },
  {
    id: '13',
    content: "The cloud storage integration is underrated. Haven't lost a single document since switching from my old setup",
    user: { 
      email: "cloud_convert",
      name: "Oliver Brown",
      avatar: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=150"
    },
    likes: 54
  },
  {
    id: '14',
    content: "Okay but can we appreciate how fast the customer support is? Had an issue, got resolved in literally 10 minutes",
    user: { 
      email: "happy_customer",
      name: "Isabella Garcia",
      avatar: "https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=150"
    },
    likes: 52
  },
  {
    id: '15',
    content: "Pro vs Ultimate tier comparison anyone? Trying to decide if the upgrade is worth it 🤔",
    user: { 
      email: "upgrade_curious",
      name: "Lucas Kim",
      avatar: "https://images.unsplash.com/photo-1567359781514-3b964e2b04d6?w=150"
    },
    likes: 49,
    replies: []
  },
  {
    id: '16',
    content: "Just processed my entire PhD thesis. The time saved is UNREAL. Why didn't I find this sooner? 😭",
    user: { 
      email: "phd_candidate",
      name: "Daniel Lee",
      avatar: "https://images.unsplash.com/photo-1553949345-eb786bb3f7ba?w=150"
    },
    likes: 47
  },
  {
    id: '17',
    content: "Hot take: The mobile app is actually better than the desktop version. Fight me 😤",
    user: { 
      email: "mobile_warrior",
      name: "Ava Williams",
      avatar: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=150"
    },
    likes: 45
  },
  {
    id: '18',
    content: "Anyone else notice the Easter egg when you convert exactly 42 files at once? 😂",
    user: { 
      email: "easter_egg_hunter",
      name: "Jack Murphy",
      avatar: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=150"
    },
    likes: 43
  },
  {
    id: '19',
    content: "The new file organization system is so clean. Finally got my research papers properly sorted!",
    user: { 
      email: "organized_academic",
      name: "Emily Foster",
      avatar: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=150"
    },
    likes: 41
  },
  {
    id: '20',
    content: "Protip: Use tags for your converted files. Makes finding stuff way easier later",
    user: { 
      email: "tag_master",
      name: "Noah Taylor",
      avatar: "https://images.unsplash.com/photo-1555952517-2e8e729e0b44?w=150"
    },
    likes: 39
  },
  {
    id: '21',
    content: "Is it just me or has the conversion speed gotten even faster lately? 🚀",
    user: { 
      email: "speed_demon",
      name: "Zoe Clark",
      avatar: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=150"
    },
    likes: 37
  },
  {
    id: '22',
    content: "The collaboration features are a lifesaver for group projects. No more version control nightmares!",
    user: { 
      email: "team_player",
      name: "Benjamin Wong",
      avatar: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=150"
    },
    likes: 35
  },
  {
    id: '23',
    content: "Fun fact: You can use keyboard shortcuts to navigate between documents. Ctrl+Arrow keys are your friends!",
    user: { 
      email: "keyboard_warrior",
      name: "Mia Rodriguez",
      avatar: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150"
    },
    likes: 33
  },
  {
    id: '24',
    content: "Just hit 1000 converted documents! This tool has literally changed how I work 🎉",
    user: { 
      email: "milestone_achiever",
      name: "Ethan Park",
      avatar: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=150"
    },
    likes: 31
  },
  {
    id: '25',
    content: "The OCR accuracy is impressive. Just converted a bunch of scanned textbooks perfectly",
    user: { 
      email: "ocr_enthusiast",
      name: "Charlotte Davis",
      avatar: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=150"
    },
    likes: 29
  },
  {
    id: '26',
    content: "Weekly reminder that you can schedule automatic conversions. Set it and forget it! 👌",
    user: { 
      email: "automation_fan",
      name: "Leo Martinez",
      avatar: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=150"
    },
    likes: 27
  },
  {
    id: '27',
    content: "Love how it preserves all my annotations when converting PDFs. Game changer for research work",
    user: { 
      email: "annotation_lover",
      name: "Victoria Chang",
      avatar: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150"
    },
    likes: 25
  },
  {
    id: '28',
    content: "The new update fixed all my formatting issues with tables. Finally! 🙌",
    user: { 
      email: "table_formatter",
      name: "Samuel Wilson",
      avatar: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=150"
    },
    likes: 23
  },
  {
    id: '29',
    content: "Just found out you can customize the reading fonts. My dyslexic friends gonna love this!",
    user: { 
      email: "accessibility_aware",
      name: "Grace Thompson",
      avatar: "https://images.unsplash.com/photo-1489533119213-66a5cd877091?w=150"
    },
    likes: 21
  }
] as Comment[];

const Community = () => {
  const session = useSession()
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS)
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set())

  useEffect(() => {
    let mounted = true
    
    // Load comments from Supabase
    const loadComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          likes,
          user_id,
          user:user_id (
            email,
            raw_user_meta_data
          ),
          replies:comments (
            id,
            content,
            created_at,
            likes,
            user_id,
            user:user_id (
              email,
              raw_user_meta_data
            )
          )
        `)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

      if (!error && data && mounted) {
        const formattedComments: Comment[] = data.map(comment => ({
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          likes: comment.likes,
          user_id: comment.user_id,
          user: {
            email: comment.user[0].email,
            name: comment.user[0].raw_user_meta_data?.full_name || comment.user[0].email,
            avatar: comment.user[0].raw_user_meta_data?.avatar_url || comment.user[0].raw_user_meta_data?.picture
          },
          replies: (comment.replies || []).map(reply => ({
            id: reply.id,
            content: reply.content,
            created_at: reply.created_at,
            likes: reply.likes,
            user_id: reply.user_id,
            user: {
              email: reply.user[0].email,
              name: reply.user[0].raw_user_meta_data?.full_name || reply.user[0].email,
              avatar: reply.user[0].raw_user_meta_data?.avatar_url || reply.user[0].raw_user_meta_data?.picture
            }
          }))
        }));
        setComments(formattedComments);
      }
    }

    loadComments()

    // Subscribe only to new comments and updates to existing ones
    const commentsSubscription = supabase
      .channel('comments-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'comments',
          filter: 'parent_id=is.null'
        }, 
        (payload) => {
          // Add new comment to the list
          if (payload.new) {
            supabase
              .from('comments')
              .select(`
                id,
                content,
                created_at,
                likes,
                user_id,
                user:user_id (
                  email,
                  raw_user_meta_data
                )
              `)
              .eq('id', payload.new.id)
              .single()
              .then(({ data }) => {
                if (data) {
                  const response = data as unknown as SupabaseComment;
                  const formattedComment: Comment = {
                    id: response.id,
                    content: response.content,
                    created_at: response.created_at,
                    likes: response.likes,
                    user_id: response.user_id,
                    user: {
                      email: response.user[0].email,
                      name: response.user[0].raw_user_meta_data?.full_name || response.user[0].email,
                      avatar: response.user[0].raw_user_meta_data?.avatar_url || response.user[0].raw_user_meta_data?.picture
                    },
                    replies: []
                  };
                  setComments(prev => [formattedComment, ...prev]);
                }
              })
          }
        })
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments'
        },
        (payload) => {
          // Update existing comment
          if (payload.new) {
            setComments(prev => prev.map(comment => 
              comment.id === payload.new.id 
                ? { ...comment, ...payload.new }
                : comment
            ))
          }
        })
      .subscribe()

    return () => {
      mounted = false
      commentsSubscription.unsubscribe()
    }
  }, [])

  const handleComment = async () => {
    if (!session?.user?.id || !newComment.trim()) return

    const { data: newCommentData, error } = await supabase
      .from('comments')
      .insert({
        content: newComment,
        user_id: session.user.id,
        likes: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error posting comment:', error)
      return
    }

    if (newCommentData) {
      const commentWithUser = {
        ...newCommentData,
        user: {
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
        },
        replies: []
      }
      setComments([commentWithUser as any, ...comments])
      setNewComment('')
    }
  }

  const handleReply = async (parentId: string) => {
    if (!session?.user?.id || !replyContent.trim()) return

    const { data: newReply, error } = await supabase
      .from('comments')
      .insert({
        content: replyContent,
        user_id: session.user.id,
        parent_id: parentId,
        likes: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Error posting reply:', error)
      return
    }

    if (newReply) {
      const replyWithUser = {
        ...newReply,
        user: {
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
          avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
        }
      }

      const updatedComments = comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), replyWithUser]
          }
        }
        return comment
      })

      setComments(updatedComments as any)
      setReplyContent('')
      setReplyTo(null)
    }
  }

  const handleLike = async (commentId: string) => {
    if (!session?.user?.id) return

    const newLikedComments = new Set(likedComments)
    const isLiked = newLikedComments.has(commentId)

    const { error } = await supabase
      .from('comments')
      .update({ 
        likes: isLiked ? `likes - 1` : `likes + 1` 
      })
      .eq('id', commentId)

    if (error) {
      console.error('Error updating likes:', error)
      return
    }

    if (isLiked) {
      newLikedComments.delete(commentId)
    } else {
      newLikedComments.add(commentId)
    }
    setLikedComments(newLikedComments)

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return { 
          ...comment, 
          likes: isLiked ? comment.likes - 1 : comment.likes + 1 
        }
      }
      return comment
    }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-[#4475F2] via-[#B344F2] to-[#F24444] bg-clip-text text-transparent">
        Community Discussions
      </h1>

      {/* Comments List */}
      <div className="space-y-6 mb-12">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-grow">
                <div className="flex items-center gap-3">
                  <img 
                    src={comment.user.avatar || '/icons/user-default.png'} 
                    alt={comment.user.name || comment.user.email}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = '/icons/user-default.png';
                      img.onerror = null;
                    }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      {comment.user.name || comment.user.email}
                      {comment.user.email === 'melody.oniooo@gmail.com' && (
                        <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-[#4475F2] to-[#B344F2] text-white rounded-full">
                          Creator
                        </span>
                      )}
                    </h3>
                    <span className="text-xs text-gray-400">• {comment.created_at || "2 days ago"}</span>
                  </div>
                </div>
                <p className="text-gray-600 mt-3">{comment.content}</p>
              </div>
              <button
                onClick={() => handleLike(comment.id)}
                className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors duration-300"
              >
                {likedComments.has(comment.id) ? (
                  <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                )}
                <span className="text-sm font-medium">{comment.likes}</span>
              </button>
            </div>

            {/* Reply Button */}
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="text-sm text-gray-400 hover:text-[#4475F2] transition-colors duration-300"
              >
                Reply
              </button>
            </div>

            {/* Reply Input */}
            {replyTo === comment.id && (
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-grow px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4475F2]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleReply(comment.id)
                    }
                  }}
                />
                <button
                  onClick={() => handleReply(comment.id)}
                  className="w-8 h-8 flex items-center justify-center bg-[#4475F2] rounded-full transition-all duration-300 hover:bg-[#65aef7] hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <img src="/icons/up-arrow.png" alt="Send" className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Replies - Limited to 5 */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 pl-6 border-l-2 border-gray-100 space-y-4">
                {comment.replies.slice(0, 5).map((reply) => (
                  <div key={reply.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3">
                          <img 
                            src={reply.user.avatar || '/icons/user-default.png'} 
                            alt={reply.user.name || reply.user.email}
                            className="w-8 h-8 rounded-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = '/icons/user-default.png';
                              img.onerror = null;
                            }}
                          />
                          <div>
                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                              {reply.user.name || reply.user.email}
                              {reply.user.email === 'melody.oniooo@gmail.com' && (
                                <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-[#4475F2] to-[#B344F2] text-white rounded-full">
                                  Creator
                                </span>
                              )}
                            </h4>
                            <span className="text-xs text-gray-400">• {reply.created_at || "10 minutes ago"}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-2 ml-11">{reply.content}</p>
                      </div>
                      <button
                        onClick={() => handleLike(reply.id)}
                        className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors duration-300"
                      >
                        {likedComments.has(reply.id) ? (
                          <svg className="w-4 h-4 text-red-500 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        )}
                        <span className="text-sm">{reply.likes}</span>
                      </button>
                    </div>
                  </div>
                ))}
                {comment.replies.length > 5 && (
                  <button className="text-sm text-[#4475F2] hover:text-[#2954c8] font-medium">
                    View {comment.replies.length - 5} more replies...
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Comment Input - Compact Version */}
      <div className="sticky bottom-0 bg-[#f5f5f5] pt-6 pb-4">
        <div className="bg-white rounded-full shadow-sm flex items-center p-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={session ? "Share your thoughts..." : "Sign in to comment"}
            className="flex-grow px-4 py-2 bg-transparent focus:outline-none"
            disabled={!session}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleComment()
              }
            }}
          />
          <button
            onClick={handleComment}
            disabled={!session}
            className="w-8 h-8 flex items-center justify-center bg-[#65aef7] rounded-full transition-all duration-300 disabled:opacity-50 hover:bg-[#2954c8] hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <img src="/icons/up-arrow.png" alt="Send" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Community 