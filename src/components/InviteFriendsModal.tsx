import React, { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({ isOpen, onClose }) => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [referralLink, setReferralLink] = useState('');
  const [signupCount, setSignupCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      const userId = session.user.id;
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/signup?ref=${userId}`);
      
      // Fetch signup count
      const fetchSignupCount = async () => {
        const { data, error } = await supabase
          .from('referrals')
          .select('count')
          .eq('referrer_id', userId)
          .single();

        if (!error && data) {
          setSignupCount(data.count);
        }
      };

      fetchSignupCount();
    }
  }, [session, supabase]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Link copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative animate-[slideIn_0.3s_ease-out]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Invite & Get 2 Months Pro!</h2>
          <p className="text-gray-600 mb-2">Share your unique link with friends</p>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-gray-50 rounded-full px-4 py-2 text-sm text-gray-600 truncate">
              {referralLink}
            </div>
            <button
              onClick={handleCopyLink}
              className="flex-shrink-0 bg-[#4475F2] text-white px-4 py-2 rounded-full hover:bg-[#2954c8] transition-colors"
            >
              Copy link
            </button>
          </div>
        </div>

        {/* Rewards Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium">2 Friends Sign Up</p>
              <p className="text-sm text-gray-500">One month of Pro Access</p>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              signupCount >= 2 ? 'bg-green-500' : 'bg-gray-200'
            }`}>
              {signupCount >= 2 && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium">4+ Friends Sign Up</p>
              <p className="text-sm text-gray-500">Two months of Pro Access</p>
            </div>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              signupCount >= 4 ? 'bg-green-500' : 'bg-gray-200'
            }`}>
              {signupCount >= 4 && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsModal; 