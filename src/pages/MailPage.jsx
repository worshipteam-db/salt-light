import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { getJobById } from "@/lib/gameData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Check, X, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

function RequestCard({ profile, request, onAccept, onDecline, loadingId }) {
  const job = getJobById(profile?.current_job || "seeker");
  const equippedCount = Array.isArray(profile?.equipped_items)
    ? profile.equipped_items.length
    : 0;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="font-display font-bold text-base leading-none truncate">
            {profile?.name || "Unknown player"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Public ID: {profile?.public_id || "Unknown"}
          </p>
        </div>

        <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-700">
          New request
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-1">
          {job.icon} {job.name}
        </span>
        <span className="text-[10px] rounded-full bg-muted px-2 py-1">
          Level {profile?.level || 1}
        </span>
        <span className="text-[10px] rounded-full bg-muted px-2 py-1">
          Faith {profile?.faith || 0}
        </span>
        <span className="text-[10px] rounded-full bg-muted px-2 py-1">
          {equippedCount} gear
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => onAccept(request.id)}
          disabled={loadingId === request.id}
        >
          <Check className="w-4 h-4 mr-2" />
          Accept
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onDecline(request.id)}
          disabled={loadingId === request.id}
        >
          <X className="w-4 h-4 mr-2" />
          Decline
        </Button>
      </div>
    </div>
  );
}

export default function MailPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [profilesByUserId, setProfilesByUserId] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  const loadRequests = async () => {
    if (!user) return;

    setIsLoading(true);

    const { data, error } = await supabase
      .from("friendships")
      .select("*")
      .eq("addressee_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setRequests([]);
      setIsLoading(false);
      return;
    }

    setRequests(data || []);
    setIsLoading(false);
  };

  const loadProfile = async (userId) => {
    if (!userId || profilesByUserId[userId]) return;

    const { data, error } = await supabase.rpc(
      "get_character_public_profile_by_user_id",
      { p_user_id: userId }
    );

    if (error) {
      console.error(error);
      return;
    }

    const profile = Array.isArray(data) ? data[0] : data?.[0] || data || null;
    if (profile) {
      setProfilesByUserId((prev) => ({ ...prev, [userId]: profile }));
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    requests.forEach((request) => loadProfile(request.requester_id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests.map((r) => r.requester_id).join(",")]);

  const respond = async (requestId, status) => {
    setActionLoadingId(requestId);

    try {
      const { error } = await supabase
        .from("friendships")
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      toast.success(
        status === "accepted" ? "Friend request accepted!" : "Friend request declined"
      );
      await loadRequests();
    } catch (err) {
      toast.error(err.message || "Could not update request");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-2 sm:px-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            Mail
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Incoming friend requests appear here.
          </p>
        </div>

        {requests.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
            {requests.length} new
          </span>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Users className="w-4 h-4" />
            Inbox
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.length === 0 ? (
            <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
              No incoming requests yet.
            </div>
          ) : (
            requests.map((request) => {
              const profile = profilesByUserId[request.requester_id];

              if (!profile) {
                return (
                  <div
                    key={request.id}
                    className="rounded-xl border bg-card p-4 text-sm text-muted-foreground"
                  >
                    Loading request...
                  </div>
                );
              }

              return (
                <RequestCard
                  key={request.id}
                  profile={profile}
                  request={request}
                  onAccept={(id) => respond(id, "accepted")}
                  onDecline={(id) => respond(id, "declined")}
                  loadingId={actionLoadingId}
                />
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <Link to="/character" className="underline">
          Back to Character
        </Link>
      </div>
    </div>
  );
}