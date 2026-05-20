import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { MessageSquare, Bug, Lightbulb, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState("bug");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  const handleCategoryChange = (value) => {
    setCategory(value);
    setSubmitted(false);
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    setSubmitted(false);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);

    try {
      const { error } = await supabase.from("feedback_reports").insert([
        {
          user_id: user.id,
          email: user.email,
          category,
          subject: subject.trim(),
          message: message.trim(),
          page_url: window.location.href,
          page_path: window.location.pathname,
        },
      ]);

      if (error) throw error;

      toast.success("Feedback sent. Thank you!");
      setSubmitted(true);

      setCategory("bug");
      setSubject("");
      setMessage("");
    } catch (err) {
      toast.error(err?.message || "Could not send feedback");
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-2 sm:px-4">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Feedback / Bug Report
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Send a bug report, suggestion, or feature idea.
        </p>
      </div>

      {submitted && (
        <Card className="border-green-500/30 bg-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-700">
                  Feedback sent successfully
                </p>
                <p className="text-xs text-green-700/80 mt-0.5">
                  Thanks — your message was submitted and saved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            Send Feedback
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="bug">
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      Bug report
                    </div>
                  </SelectItem>

                  <SelectItem value="feature">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Feature idea
                    </div>
                  </SelectItem>

                  <SelectItem value="improvement">
                    Improvement
                  </SelectItem>

                  <SelectItem value="other">
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={subject}
                onChange={handleSubjectChange}
                placeholder="Short summary..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={message}
                onChange={handleMessageChange}
                placeholder="Describe what happened, what you expected, or what you want added..."
                className="min-h-[220px] resize-y"
              />
            </div>

            <Button
              type="submit"
              className="w-full font-display"
              disabled={submitting || !subject.trim() || !message.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              {submitting ? "Sending..." : "Send Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}