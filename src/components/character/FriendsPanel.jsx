import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { useCharacter } from "@/lib/useCharacter";
import { getJobById } from "@/lib/gameData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Check,
  X,
  Copy,
  UserMinus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

function ProfileCard({ profile, actionSlot, subtitle }) {
  if (!profile) return null;

  const job = getJobById(profile.current_job || "seeker");
  const equippedCount = Array.isArray(profile.equipped_items)
    ? profile.equipped_items.length
    : 0;

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="font-display font-bold text-base leading-none truncate">
            {profile.name}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {subtitle || profile.public_id}
          </p>
        </div>

        {actionSlot}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-[10px] rounded-full bg-primary/10 text-primary px-2 py-1">
          {job.icon} {job.name}
        </span>
        <span className="text-[10px] rounded-full bg-muted px-2 py-1">
          Level {profile.level || 1}
        </span>
        <span className="text-[10px] rounded-full bg-muted px-2 py-1">
          Faith {profile.faith || 0}
        </span>
        <span className="text-[10px] rounded-full bg-muted px-2 py-1">
          XP {profile.total_xp || 0}
        </span>
        <span className="text-[10px] rounded-full bg-muted px-2 py-1">
          {equippedCount} gear
        </span>
      </div>
    </div>
  );
}

export default function FriendsPanel() {
  const { user } = useAuth();
  const { character } = useCharacter();

  const [requestSent, setRequestSent] = useState("");
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [friendships, setFriendships] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [profilesByUserId, setProfilesByUserId] = useState({});

  const loadFriendships = async () => {
    if (!user) return;

    setLoadingFriends(true);
    const { data, error } = await supabase
      .from("friendships")
      .select("*")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setFriendships([]);
      setLoadingFriends(false);
      return;
    }

    setFriendships(data || []);
    setLoadingFriends(false);
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
    loadFriendships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const incomingRequests = useMemo(
    () =>
      friendships.filter(
        (f) => f.status === "pending" && f.addressee_id === user?.id
      ),
    [friendships, user?.id]
  );

  const outgoingRequests = useMemo(
    () =>
      friendships.filter(
        (f) => f.status === "pending" && f.requester_id === user?.id
      ),
    [friendships, user?.id]
  );

  const acceptedFriends = useMemo(
    () => friendships.filter((f) => f.status === "accepted"),
    [friendships]
  );

  const friendUserIds = useMemo(() => {
    const ids = acceptedFriends.map((f) =>
      f.requester_id === user?.id ? f.addressee_id : f.requester_id
    );
    return [...new Set(ids)];
  }, [acceptedFriends, user?.id]);

  const requestUserIds = useMemo(() => {
    const ids = [
      ...incomingRequests.map((f) => f.requester_id),
      ...outgoingRequests.map((f) => f.addressee_id),
    ];
    return [...new Set(ids)];
  }, [incomingRequests, outgoingRequests]);

  useEffect(() => {
    [...friendUserIds, ...requestUserIds].forEach((id) => loadProfile(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendUserIds.join(","), requestUserIds.join(",")]);

  const handleCopyPublicId = async () => {
    if (!character?.public_id) return;
    try {
      await navigator.clipboard.writeText(character.public_id);
      toast.success("Public ID copied!");
    } catch {
      toast.error("Could not copy ID");
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) return;

    setSearching(true);
    setSearchError("");
    setSearchResult(null);
    setRequestSent("");

    try {
      const publicId = searchId.trim().toUpperCase();
      const { data, error } = await supabase.rpc(
        "search_character_by_public_id",
        { p_public_id: publicId }
      );

      if (error) throw error;

      const result = Array.isArray(data) ? data[0] : data?.[0] || data || null;

      if (!result) {
        setSearchError("No character found with that ID.");
        return;
      }

      if (
        result.addressee_id === user?.id ||
        result.public_id === character?.public_id
      ) {
        setSearchError("You cannot add yourself as a friend.");
        setSearchResult(null);
        return;
      }

      setSearchResult(result);
    } catch (err) {
      setSearchError(err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (target) => {
    if (!user || !target?.addressee_id) return;

    if (
      target.addressee_id === user?.id ||
      target.public_id === character?.public_id
    ) {
      toast.error("You cannot send a friend request to yourself.");
      return;
    }

    const existing = friendships.find(
      (f) =>
        f.requester_id === user.id && f.addressee_id === target.addressee_id
    );

    if (existing && existing.status === "accepted") {
      toast.info("You are already friends.");
      return;
    }

    if (existing && existing.status === "pending") {
      toast.info("Friend request already sent.");
      return;
    }

    setActionLoadingId(target.addressee_id);

    try {
      const { error } = await supabase.from("friendships").insert([
        {
          requester_id: user.id,
          addressee_id: target.addressee_id,
          status: "pending",
        },
      ]);

      if (error) throw error;

      toast.success("Friend request sent!");
      setRequestSent(`Friend request sent to ${target.name || target.public_id}.`);
      setSearchId("");
      await loadFriendships();
    } catch (err) {
      toast.error(err.message || "Could not send request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const respondToRequest = async (requestId, status) => {
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
        status === "accepted" ? "Request accepted!" : "Request declined"
      );
      await loadFriendships();
    } catch (err) {
      toast.error(err.message || "Could not update request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const removeFriend = async (friendshipId) => {
    setActionLoadingId(friendshipId);

    try {
      const { error } = await supabase
        .from("friendships")
        .delete()
        .eq("id", friendshipId);

      if (error) throw error;

      toast.success("Friend removed");
      await loadFriendships();
    } catch (err) {
      toast.error(err.message || "Could not remove friend");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loadingFriends) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const renderPublicId = character?.public_id || "Loading...";

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-medium">Your Public ID</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share this ID so others can add you.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <code className="rounded-lg bg-muted px-3 py-2 text-sm font-mono">
                {renderPublicId}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={handleCopyPublicId}
                title="Copy public ID"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                setRequestSent("");
              }}
              placeholder="Search by Public ID (e.g. SL-ABC12345)"
              className="font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              type="button"
              onClick={handleSearch}
              disabled={searching || !searchId.trim()}
              className="sm:min-w-[140px]"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {searchError && <p className="text-sm text-red-600">{searchError}</p>}

          {requestSent && (
            <p className="text-sm text-green-600">{requestSent}</p>
          )}

          {searchResult && (
            <ProfileCard
              profile={searchResult}
              subtitle={`Public ID: ${searchResult.public_id}`}
              actionSlot={
                <Button
                  type="button"
                  onClick={() => sendRequest(searchResult)}
                  disabled={
                    actionLoadingId === searchResult.addressee_id ||
                    searchResult.addressee_id === user?.id ||
                    searchResult.public_id === character?.public_id
                  }
                  className="min-h-[40px]"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send Request
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-sm font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Inbox
          </h3>

          {incomingRequests.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-semibold text-white">
              {incomingRequests.length} new
            </span>
          )}
        </div>

        {incomingRequests.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            No incoming requests yet.
          </div>
        ) : (
          <div className="space-y-3">
            {incomingRequests.map((request) => {
              const profile = profilesByUserId[request.requester_id];
              return (
                <div key={request.id}>
                  {profile ? (
                    <ProfileCard
                      profile={profile}
                      subtitle="Incoming request"
                      actionSlot={
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => respondToRequest(request.id, "accepted")}
                            disabled={actionLoadingId === request.id}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => respondToRequest(request.id, "declined")}
                            disabled={actionLoadingId === request.id}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      }
                    />
                  ) : (
                    <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
                      Incoming request loading...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4" />
          Friends
        </h3>

        {acceptedFriends.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            No friends yet.
          </div>
        ) : (
          <div className="space-y-3">
            {acceptedFriends.map((friendship) => {
              const friendId =
                friendship.requester_id === user?.id
                  ? friendship.addressee_id
                  : friendship.requester_id;
              const profile = profilesByUserId[friendId];

              return profile ? (
                <ProfileCard
                  key={friendship.id}
                  profile={profile}
                  subtitle="Accepted friend"
                  actionSlot={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFriend(friendship.id)}
                      disabled={actionLoadingId === friendship.id}
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  }
                />
              ) : (
                <div
                  key={friendship.id}
                  className="rounded-xl border bg-card p-4 text-sm text-muted-foreground"
                >
                  Friend profile loading...
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold">Sent Requests</h3>

        {outgoingRequests.length === 0 ? (
          <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
            No outgoing requests.
          </div>
        ) : (
          <div className="space-y-3">
            {outgoingRequests.map((request) => {
              const profile = profilesByUserId[request.addressee_id];
              return profile ? (
                <ProfileCard
                  key={request.id}
                  profile={profile}
                  subtitle="Request sent"
                  actionSlot={
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-semibold text-amber-700">
                      Pending
                    </span>
                  }
                />
              ) : (
                <div
                  key={request.id}
                  className="rounded-xl border bg-card p-4 text-sm text-muted-foreground"
                >
                  Sent request loading...
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}