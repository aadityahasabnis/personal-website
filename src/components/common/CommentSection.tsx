"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type FormEvent,
} from "react";
import Image from "next/image";
import {
  useComments,
  usePostComment,
  useUpvoteComment,
  type ContentType,
} from "@/hooks/useContentData";
import {
  MessageSquare,
  Send,
  AlertCircle,
  Loader2,
  User,
  Reply as ReplyIcon,
  Shield,
  X,
  ArrowBigUpDash,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { siteStorage, getAvatarById } from "@/lib/storage";
import { AvatarSelector } from "@/components/content/AvatarSelector";

interface ICommentSectionProps {
  slug: string;
  contentType: ContentType;
  className?: string;
}

interface IComment {
  _id: string;
  author: {
    name: string;
    avatar?: string;
    isAuthor?: boolean;
  };
  content: string;
  likes: number;
  upvotes: number;
  replies?: IComment[];
  createdAt: string;
}

/**
 * CommentSection - Phase 2 Redesign
 *
 * NEW FEATURES:
 * - Auto-focus + auto-scroll on "Write Comment"
 * - Auto-close form after submit
 * - Reply form appears BELOW parent comment (inline)
 * - Cancel button (top-right)
 * - Upvote system with localStorage
 * - Reply/Upvote buttons in header (right side)
 * - Filled upvote icon on click (lavender)
 * - Professional layout restructure
 */
export function CommentSection({
  slug,
  contentType,
  className,
}: ICommentSectionProps) {
  const {
    data: commentsData,
    isLoading,
    refetch,
  } = useComments(slug, contentType);
  const postMutation = usePostComment(slug, contentType);

  const [showForm, setShowForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(() => {
    const saved = siteStorage.getCommentAuthor();
    return saved?.avatar || "avatar-1";
  });

  // Refs for auto-focus
  const formRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved author info on mount
  useEffect(() => {
    const savedAuthor = siteStorage.getCommentAuthor();
    if (savedAuthor) {
      setName(savedAuthor.name);
      setEmail(savedAuthor.email);
      setSelectedAvatar(savedAuthor.avatar);
    }
  }, []);

  // Auto-focus and scroll when form opens
  useEffect(() => {
    if (showForm && formRef.current) {
      // Smooth scroll to form
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);

      // Auto-focus first field
      setTimeout(() => {
        const hasAuthorInfo = siteStorage.hasCommentAuthor();
        if (hasAuthorInfo && textareaRef.current) {
          textareaRef.current.focus();
        } else if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 400);
    }
  }, [showForm]);

  const comments = commentsData?.data ?? [];
  const total = commentsData?.metadata?.total ?? 0;

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      postMutation.mutate(
        {
          author: { name, email, avatar: selectedAvatar },
          content,
          replyTo: replyingTo?.id,
        },
        {
          onSuccess: () => {
            // Clear form
            setContent("");
            setReplyingTo(null);

            // Save author info
            siteStorage.setCommentAuthor({
              name,
              email,
              avatar: selectedAvatar,
            });

            // Update profile
            const userProfile = siteStorage.getUserProfile();
            if (!userProfile?.subscribedAt) {
              siteStorage.updateUserProfile({
                name,
                email,
                avatar: selectedAvatar,
                subscribedAt: new Date().toISOString(),
              });
            }

            // Auto-close form
            setShowForm(false);

            // Refetch to show new comment immediately
            setTimeout(() => refetch(), 500);
          },
        },
      );
    },
    [name, email, content, selectedAvatar, replyingTo, postMutation, refetch],
  );

  const handleReply = (commentId: string, authorName: string) => {
    setReplyingTo({ id: commentId, name: authorName });
    // Don't set showForm to true - the inline form will handle this
  };

  const handleCancel = () => {
    setShowForm(false);
    setReplyingTo(null);
    setContent("");
  };

  return (
    <section className={cn("mt-12 md:mt-16", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[#9b87f5]/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="size-5 text-[#9b87f5]" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[var(--fg)]">
              Comments
            </h2>
            {!isLoading && (
              <p className="text-xs md:text-sm text-[var(--fg-muted)]">
                {total} {total === 1 ? "comment" : "comments"}
              </p>
            )}
          </div>
        </div>
        {!showForm && !replyingTo && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={cn(
              "inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full",
              "bg-[#9b87f5] text-white",
              "font-medium text-sm",
              "hover:bg-[#8b77e5] transition-colors",
              "shadow-lg shadow-[#9b87f5]/20",
              "w-full sm:w-auto justify-center sm:justify-start",
            )}
          >
            <MessageSquare className="size-4" />
            Write a comment
          </button>
        )}
      </div>

      {/* Comment Form - Top level only (not when replying) */}
      {showForm && !replyingTo && (
        <div
          ref={formRef}
          id="comment-form"
          className="mb-6 md:mb-8 p-4 md:p-6 border-2 border-[#9b87f5]/20 rounded-2xl bg-gradient-to-br from-[#9b87f5]/5 to-transparent relative"
        >
          {/* Cancel Button - Top Right */}
          <button
            type="button"
            onClick={handleCancel}
            className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full hover:bg-[var(--surface)] transition-colors text-[var(--fg-subtle)] hover:text-[var(--fg)]"
            aria-label="Cancel"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <User className="size-5 text-[#9b87f5]" />
            <h3 className="text-base md:text-lg font-semibold text-[var(--fg)]">
              Share your thoughts
            </h3>
          </div>

          {postMutation.isError && (
            <div className="flex items-center gap-2 p-3 md:p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
              <AlertCircle className="size-5 flex-shrink-0" />
              <p className="text-sm">
                Failed to post comment. Please try again.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onSelect={setSelectedAvatar}
            />

            <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
              <input
                ref={firstInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                placeholder="Your name"
                className={cn(
                  "px-3 md:px-4 py-2.5 md:py-3 rounded-xl border-2 border-[var(--border-color)]",
                  "bg-[var(--bg)] text-[var(--fg)] text-sm md:text-base",
                  "placeholder:text-[var(--fg-subtle)]",
                  "focus:outline-none focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20",
                  "transition-all",
                )}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className={cn(
                  "px-3 md:px-4 py-2.5 md:py-3 rounded-xl border-2 border-[var(--border-color)]",
                  "bg-[var(--bg)] text-[var(--fg)] text-sm md:text-base",
                  "placeholder:text-[var(--fg-subtle)]",
                  "focus:outline-none focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20",
                  "transition-all",
                )}
              />
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              minLength={10}
              maxLength={5000}
              rows={4}
              placeholder="Share your thoughts..."
              className={cn(
                "w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border-2 border-[var(--border-color)]",
                "bg-[var(--bg)] text-[var(--fg)] text-sm md:text-base",
                "placeholder:text-[var(--fg-subtle)]",
                "focus:outline-none focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20",
                "resize-none transition-all",
              )}
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
              <p className="text-xs text-[var(--fg-subtle)]">
                ✨ By commenting, you'll be subscribed to our newsletter
              </p>
              <button
                type="submit"
                disabled={postMutation.isPending}
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 md:py-3 rounded-full",
                  "bg-[#9b87f5] text-white font-medium text-sm",
                  "hover:bg-[#8b77e5] transition-all",
                  "shadow-lg shadow-[#9b87f5]/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus:outline-none focus:ring-2 focus:ring-[#9b87f5] focus:ring-offset-2",
                  "w-full sm:w-auto",
                )}
              >
                {postMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Post Comment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3 md:space-y-4">
        {isLoading ? (
          <CommentsSkeleton />
        ) : comments.length === 0 ? (
          <div
            className="text-center py-12 md:py-16 border-2 border-dashed border-[var(--border-color)] rounded-2xl cursor-pointer hover:border-[#9b87f5]/50 transition-colors group"
            onClick={() => setShowForm(true)}
          >
            <div className="size-12 md:size-16 mx-auto mb-3 md:mb-4 rounded-full bg-[#9b87f5]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="size-6 md:size-8 text-[#9b87f5]" />
            </div>
            <p className="text-[var(--fg-muted)] text-base md:text-lg font-medium">
              No comments yet
            </p>
            <p className="text-[var(--fg-subtle)] text-sm mt-1">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              slug={slug}
              contentType={contentType}
              onReply={handleReply}
              replyingTo={replyingTo}
              showForm={showForm}
              formRef={formRef}
              firstInputRef={firstInputRef}
              textareaRef={textareaRef}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              content={content}
              setContent={setContent}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
              handleSubmit={handleSubmit}
              handleCancel={handleCancel}
              postMutation={postMutation}
            />
          ))
        )}
      </div>
    </section>
  );
}

// Comment Card Component
interface ICommentCardProps {
  comment: IComment;
  slug: string;
  contentType: ContentType;
  onReply: (commentId: string, authorName: string) => void;
  isReply?: boolean;
  replyingTo: { id: string; name: string } | null;
  showForm: boolean;
  formRef: React.RefObject<HTMLDivElement | null>;
  firstInputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  content: string;
  setContent: (content: string) => void;
  selectedAvatar: string;
  setSelectedAvatar: (avatar: string) => void;
  handleSubmit: (e: FormEvent) => void;
  handleCancel: () => void;
  postMutation: any;
}

function CommentCard({
  comment,
  slug,
  contentType,
  onReply,
  isReply = false,
  replyingTo,
  showForm,
  formRef,
  firstInputRef,
  textareaRef,
  name,
  setName,
  email,
  setEmail,
  content,
  setContent,
  selectedAvatar,
  setSelectedAvatar,
  handleSubmit,
  handleCancel,
  postMutation,
}: ICommentCardProps) {
  const avatar = getAvatarById(comment.author.avatar || "avatar-1");

  // Use upvote mutation hook
  const upvoteMutation = useUpvoteComment(slug, contentType);

  // Upvote state with localStorage persistence (same pattern as like button)
  const [userHasUpvoted, setUserHasUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(comment.upvotes || 0);

  // Sync with localStorage on mount
  useEffect(() => {
    setUserHasUpvoted(siteStorage.hasUpvotedComment(comment._id));
  }, [comment._id]);

  // Update count when comment.upvotes changes (from refetch)
  useEffect(() => {
    setUpvoteCount(comment.upvotes || 0);
  }, [comment.upvotes]);

  const handleUpvote = () => {
    // Check localStorage before upvoting
    const alreadyUpvoted = siteStorage.hasUpvotedComment(comment._id);

    if (alreadyUpvoted) {
      console.log("❌ Already upvoted this comment");
      return;
    }

    // Prevent multiple clicks while loading
    if (upvoteMutation.isPending) {
      console.log("⏳ Upvote pending, please wait");
      return;
    }

    console.log("✅ Upvoting comment...");

    // Optimistic update
    setUserHasUpvoted(true);
    setUpvoteCount((prev) => prev + 1);
    siteStorage.setCommentUpvoted(comment._id);

    // Call API to increment upvote count in DB
    upvoteMutation.mutate(comment._id, {
      onError: (error) => {
        console.error("Failed to upvote:", error);
        // Rollback on error
        setUserHasUpvoted(false);
        setUpvoteCount((prev) => prev - 1);
        siteStorage.removeCommentUpvote(comment._id);
      },
    });
  };

  // Show inline reply form when this comment is being replied to
  const isReplyFormOpen = replyingTo?.id === comment._id;

  return (
    <div className={cn("group", isReply && "ml-6 sm:ml-8 md:ml-12")}>
      <div className="p-4 md:p-5 border-2 border-[var(--border-color)] rounded-xl md:rounded-2xl bg-[var(--card-bg)] hover:border-[#9b87f5]/30 transition-all hover:shadow-lg hover:shadow-[#9b87f5]/5">
        <div className="flex items-start gap-3 md:gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 size-10 md:size-11 rounded-full overflow-hidden border-2 border-[#9b87f5]/30 shadow-sm">
            <Image
              src={avatar?.image || "/avatars/avatar-1.png"}
              alt={avatar?.label || "User avatar"}
              width={44}
              height={44}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header - Name + Actions */}
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              {/* Left: Author Info */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-[var(--fg)] text-sm md:text-base">
                  {comment.author.name}
                </span>
                {comment.author.isAuthor && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#9b87f5] text-white text-xs font-medium"
                    title="Content Author"
                  >
                    <Shield className="size-3" />
                    Author
                  </span>
                )}
                <span className="text-xs md:text-sm text-[var(--fg-subtle)]">
                  • {formatDate(new Date(comment.createdAt))}
                </span>
              </div>

              {/* Right: Reply + Upvote */}
              <div className="flex items-center gap-2">
                {!isReply && (
                  <button
                    type="button"
                    onClick={() => onReply(comment._id, comment.author.name)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs md:text-sm text-[var(--fg-subtle)] hover:text-[#9b87f5] hover:bg-[#9b87f5]/5 transition-colors"
                  >
                    <ReplyIcon className="size-3.5" />
                    Reply
                  </button>
                )}

                {/* Upvote Button */}
                <button
                  type="button"
                  onClick={handleUpvote}
                  disabled={userHasUpvoted}
                  aria-label={
                    userHasUpvoted
                      ? "You upvoted this comment"
                      : "Upvote this comment"
                  }
                  aria-pressed={userHasUpvoted}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
                    "text-xs md:text-sm font-medium transition-all",
                    userHasUpvoted
                      ? [
                          "bg-[#9b87f5] text-white",
                          "cursor-not-allowed",
                          "shadow-md shadow-[#9b87f5]/30",
                        ]
                      : [
                          "text-[var(--fg-subtle)] hover:text-[#9b87f5]",
                          "hover:bg-[#9b87f5]/5",
                          "border border-[var(--border-color)] hover:border-[#9b87f5]/30",
                        ],
                  )}
                >
                  <ArrowBigUpDash
                    className={cn(
                      "size-3.5 transition-all",
                      userHasUpvoted && "fill-current",
                    )}
                  />
                  {upvoteCount}
                </button>
              </div>
            </div>

            {/* Content */}
            <p className="text-[var(--fg-muted)] whitespace-pre-wrap break-words leading-relaxed text-sm md:text-base">
              {comment.content}
            </p>
          </div>
        </div>
      </div>

      {/* Inline Reply Form - Appears BELOW this comment */}
      {isReplyFormOpen && (
        <div
          ref={formRef}
          className="mt-3 ml-6 sm:ml-8 md:ml-12 p-4 md:p-5 border-2 border-[#9b87f5]/20 rounded-xl bg-gradient-to-br from-[#9b87f5]/5 to-transparent relative"
        >
          {/* Cancel Button */}
          <button
            type="button"
            onClick={handleCancel}
            className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 rounded-full hover:bg-[var(--surface)] transition-colors text-[var(--fg-subtle)] hover:text-[var(--fg)]"
            aria-label="Cancel"
          >
            <X className="size-3.5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <User className="size-4 text-[#9b87f5]" />
            <h4 className="text-sm md:text-base font-semibold text-[var(--fg)]">
              Reply to {replyingTo.name}
            </h4>
          </div>

          {postMutation.isError && (
            <div className="flex items-center gap-2 p-3 mb-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
              <AlertCircle className="size-4 flex-shrink-0" />
              <p className="text-xs">Failed to post reply. Please try again.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onSelect={setSelectedAvatar}
            />

            <div className="grid gap-2 sm:grid-cols-2">
              <input
                ref={firstInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                placeholder="Your name"
                className={cn(
                  "px-3 py-2 rounded-lg border-2 border-[var(--border-color)]",
                  "bg-[var(--bg)] text-[var(--fg)] text-sm",
                  "placeholder:text-[var(--fg-subtle)]",
                  "focus:outline-none focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20",
                  "transition-all",
                )}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className={cn(
                  "px-3 py-2 rounded-lg border-2 border-[var(--border-color)]",
                  "bg-[var(--bg)] text-[var(--fg)] text-sm",
                  "placeholder:text-[var(--fg-subtle)]",
                  "focus:outline-none focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20",
                  "transition-all",
                )}
              />
            </div>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              minLength={10}
              maxLength={5000}
              rows={3}
              placeholder="Share your thoughts..."
              className={cn(
                "w-full px-3 py-2 rounded-lg border-2 border-[var(--border-color)]",
                "bg-[var(--bg)] text-[var(--fg)] text-sm",
                "placeholder:text-[var(--fg-subtle)]",
                "focus:outline-none focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20",
                "resize-none transition-all",
              )}
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={postMutation.isPending}
                className={cn(
                  "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full",
                  "bg-[#9b87f5] text-white font-medium text-sm",
                  "hover:bg-[#8b77e5] transition-all",
                  "shadow-lg shadow-[#9b87f5]/30",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus:outline-none focus:ring-2 focus:ring-[#9b87f5] focus:ring-offset-2",
                )}
              >
                {postMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5" />
                    Post Reply
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3 relative">
          {/* Thread line */}
          <div className="absolute left-3 md:left-4 top-0 bottom-0 w-0.5 bg-[#9b87f5]/20" />
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply._id}
              comment={reply}
              slug={slug}
              contentType={contentType}
              onReply={onReply}
              isReply={true}
              replyingTo={replyingTo}
              showForm={showForm}
              formRef={formRef}
              firstInputRef={firstInputRef}
              textareaRef={textareaRef}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              content={content}
              setContent={setContent}
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
              handleSubmit={handleSubmit}
              handleCancel={handleCancel}
              postMutation={postMutation}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentsSkeleton() {
  return (
    <div className="space-y-3 md:space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 md:p-6 border-2 border-[var(--border-color)] rounded-xl md:rounded-2xl"
        >
          <div className="flex items-start gap-3 md:gap-4">
            <div className="size-10 md:size-11 rounded-full bg-[var(--surface)] animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-24 md:w-32 bg-[var(--surface)] animate-pulse rounded" />
              <div className="h-16 md:h-20 w-full bg-[var(--surface)] animate-pulse rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
