export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ---------- POST /api/user ----------
    if (url.pathname === "/api/user" && request.method === "POST") {
      const body = await request.json();
      const userName = body.name?.trim();
      const teamName = body.team?.trim().toLowerCase(); // NORMALISERET

      if (!userName || !teamName) {
        return new Response(JSON.stringify({ error: "Missing name or team" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Find eller opret team
      let team = await env.DB.prepare(
        "SELECT id, name FROM teams WHERE name = ?"
      ).bind(teamName).first();

      if (!team) {
        const insertTeam = await env.DB.prepare(
          "INSERT INTO teams (name) VALUES (?)"
        ).bind(teamName).run();

        team = {
          id: insertTeam.meta.last_row_id,
          name: teamName
        };
      }

      // Find eller opret bruger
      let user = await env.DB.prepare(
        "SELECT id, name FROM users WHERE name = ? AND team_id = ?"
      ).bind(userName, team.id).first();

      if (!user) {
        const insertUser = await env.DB.prepare(
          "INSERT INTO users (name, team_id) VALUES (?, ?)"
        ).bind(userName, team.id).run();

        user = {
          id: insertUser.meta.last_row_id,
          name: userName
        };
      }

      return new Response(JSON.stringify({
        user_id: user.id,
        team_id: team.id,
        team_name: team.name
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ---------- POST /api/break ----------
    if (url.pathname === "/api/break" && request.method === "POST") {
      const body = await request.json();
      const name = body.name?.trim() || "Ukendt";
      const teamName = body.team?.trim().toLowerCase(); // NORMALISERET
      const activity = body.activity?.trim();

      if (!teamName || !activity) {
        return new Response(JSON.stringify({ error: "Missing data" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      await env.DB.prepare(
        "INSERT INTO breaks (name, team, activity) VALUES (?, ?, ?)"
      ).bind(name, teamName, activity).run();

      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ---------- GET /api/feed ----------
    if (url.pathname === "/api/feed") {
      const result = await env.DB.prepare(
        "SELECT name, team, activity, created_at FROM breaks ORDER BY created_at DESC LIMIT 5"
      ).all();

      return new Response(JSON.stringify(result.results), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ---------- GET /api/team/feed ----------
    if (url.pathname === "/api/team/feed") {
      const teamName = url.searchParams.get("team")?.trim().toLowerCase(); // NORMALISERET

      if (!teamName) {
        return new Response(JSON.stringify({ error: "Missing team" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const result = await env.DB.prepare(
        "SELECT name, team, activity, created_at FROM breaks WHERE team = ? ORDER BY created_at DESC LIMIT 20"
      ).bind(teamName).all();

      return new Response(JSON.stringify(result.results), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ---------- GET /api/team/users ----------
    if (url.pathname === "/api/team/users") {
      const teamName = url.searchParams.get("team")?.trim().toLowerCase(); // NORMALISERET

      if (!teamName) {
        return new Response(JSON.stringify({ error: "Missing team" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const team = await env.DB.prepare(
        "SELECT id FROM teams WHERE name = ?"
      ).bind(teamName).first();

      if (!team) {
        return new Response(JSON.stringify([]), {
          headers: { "Content-Type": "application/json" }
        });
      }

      const users = await env.DB.prepare(
        "SELECT id, name FROM users WHERE team_id = ? ORDER BY name ASC"
      ).bind(team.id).all();

      return new Response(JSON.stringify(users.results), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ---------- GET /api/team/stats ----------
    if (url.pathname === "/api/team/stats") {
      const teamName = url.searchParams.get("team")?.trim().toLowerCase(); // NORMALISERET

      if (!teamName) {
        return new Response(JSON.stringify({ error: "Missing team" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const team = await env.DB.prepare(
        "SELECT id FROM teams WHERE name = ?"
      ).bind(teamName).first();

      if (!team) {
        return new Response(JSON.stringify({ error: "Team not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }

      const total = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM breaks WHERE team = ?"
      ).bind(teamName).first();

      const perUser = await env.DB.prepare(
        `SELECT users.name, COUNT(breaks.id) AS count
         FROM users
         LEFT JOIN breaks ON breaks.name = users.name AND breaks.team = ?
         WHERE users.team_id = ?
         GROUP BY users.id
         ORDER BY count DESC`
      ).bind(teamName, team.id).all();

      const perDay = await env.DB.prepare(
        `SELECT DATE(created_at) AS day, COUNT(*) AS count
         FROM breaks
         WHERE team = ?
           AND created_at >= DATE('now', '-7 days')
         GROUP BY DATE(created_at)
         ORDER BY day ASC`
      ).bind(teamName).all();

      return new Response(JSON.stringify({
        total_breaks: total.count,
        breaks_per_user: perUser.results,
        breaks_per_day: perDay.results
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // ---------- Fallback ----------
    return new Response("Plug & Pause backend running");
  }
};
