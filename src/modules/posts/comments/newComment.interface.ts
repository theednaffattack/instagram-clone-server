export interface NewCommentPayload {
  postId: string;
  created_at: string; // limitation of Redis payload serialization
  content: string;
}
