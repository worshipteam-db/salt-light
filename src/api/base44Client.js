import { supabase } from "@/lib/supabase";

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

function makeEntity(tableName) {
  return {
    async filter(filters = {}) {
      let query = supabase.from(tableName).select("*").order("created_at", { ascending: false });

      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== "") {
          query = query.eq(key, value);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async list(filters = {}) {
      return this.filter(filters);
    },

    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },

    async create(payload = {}) {
      const user = await getCurrentUser();
      const row = {
        ...payload,
        user_id: payload.user_id ?? user.id,
        created_by: payload.created_by ?? user.email,
      };

      const { data, error } = await supabase
        .from(tableName)
        .insert(row)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(id, payload = {}) {
      const { data, error } = await supabase
        .from(tableName)
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq("id", id);
      if (error) throw error;
      return true;
    },

    async remove(id) {
      return this.delete(id);
    },
  };
}

const db = {
  auth: {
    me: getCurrentUser,
    isAuthenticated: async () => {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    },
    signOut: () => supabase.auth.signOut(),

    // Password recovery
    resetPasswordForEmail: (email, options = {}) =>
      supabase.auth.resetPasswordForEmail(email, options),

    // Used after the reset email link brings the user back in
    updateUser: (attributes = {}) => supabase.auth.updateUser(attributes),
  },

  entities: {
    Character: makeEntity("characters"),
    Goal: makeEntity("goals"),
    Devotion: makeEntity("devotions"),
    ActivityLog: makeEntity("activity_logs"),
    Profile: makeEntity("profiles"),

    characters: makeEntity("characters"),
    goals: makeEntity("goals"),
    devotions: makeEntity("devotions"),
    activity_logs: makeEntity("activity_logs"),
    profiles: makeEntity("profiles"),
  },

  integrations: {
    Core: {
      UploadFile: async () => ({ file_url: "" }),
    },
  },
};

export { db };
export default db;