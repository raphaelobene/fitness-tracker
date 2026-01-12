"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddComment,
  useComments,
  useDeleteComment,
} from "@/hooks/use-social";
import { User } from "@/lib/auth/auth";
import { Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AvatarWrapper from "../avatar-wrapper";
import ReactTimeAgo from "../react-time-ago";

interface CommentListProps {
  workoutId: string;
  user: User;
}

export function CommentList({ workoutId, user }: CommentListProps) {
  const [content, setContent] = useState("");
  const { data: comments, isLoading } = useComments(workoutId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await addComment.mutateAsync({ workoutId, content });
    setContent("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6" id="comments">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
        />
        <Button
          type="submit"
          disabled={!content.trim() || addComment.isPending}
        >
          {addComment.isPending ? "Posting..." : "Post Comment"}
        </Button>
      </form>

      <div className="space-y-4">
        {comments?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No comments yet</p>
        ) : (
          comments?.map((comment) => {
            return (
              <div key={comment.id} className="flex gap-3">
                <Link href={`/profile/${comment.user.username}`}>
                  <AvatarWrapper user={comment.user} />
                </Link>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${comment.user.username}`}
                      className="font-medium hover:underline"
                    >
                      {comment.user.name || comment.user.username}
                    </Link>

                    <ReactTimeAgo
                      date={comment.createdAt}
                      className="text-xs text-muted-foreground"
                    />

                    {user.id === comment.userId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={() => deleteComment.mutate(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
