import {
  Trophy,
  CalendarDays,
  Clock3,
  Users,
  Play,
  ArrowRight,
} from "lucide-react";

const runningContest = {
  title: "Weekly Contest #25",
  duration: "2 Hours",
  participants: 1248,
  endsIn: "01:12:45",
};

const upcomingContests = [
  {
    id: 1,
    title: "Beginner Contest #14",
    date: "Aug 3, 2026",
    duration: "2 Hours",
    participants: 350,
  },
  {
    id: 2,
    title: "Monthly Challenge",
    date: "Aug 10, 2026",
    duration: "3 Hours",
    participants: 740,
  },
];

const pastContests = [
  {
    id: 1,
    title: "Weekly Contest #24",
    winner: "Arafat",
    participants: 1092,
  },
  {
    id: 2,
    title: "Algorithms Cup",
    winner: "Nafis",
    participants: 874,
  },
  {
    id: 3,
    title: "Dynamic Programming Challenge",
    winner: "Rahim",
    participants: 623,
  },
];

export default function Contests() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Hero */}

      <div className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-14">

          <div className="flex items-center gap-3">
            <Trophy className="text-yellow-400" size={34} />
            <h1 className="text-4xl font-bold">
              Programming Contests
            </h1>
          </div>

          <p className="mt-4 max-w-2xl text-lg text-slate-400">
            Compete with programmers around the world, solve challenging
            problems under time pressure, and improve your ranking.
          </p>

        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Running Contest */}

        <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-900/40 to-slate-900 p-8">

          <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold">
            LIVE NOW
          </span>

          <h2 className="mt-4 text-3xl font-bold">
            {runningContest.title}
          </h2>

          <div className="mt-6 flex flex-wrap gap-8">

            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-indigo-400" />
              {runningContest.duration}
            </div>

            <div className="flex items-center gap-2">
              <Users size={18} className="text-indigo-400" />
              {runningContest.participants} Participants
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-indigo-400" />
              Ends In {runningContest.endsIn}
            </div>

          </div>

          <button className="mt-8 flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 font-semibold hover:bg-indigo-400 transition">

            <Play size={18} />

            Enter Contest

          </button>

        </div>

        {/* Upcoming */}

        <h2 className="mt-14 mb-6 text-2xl font-bold">
          Upcoming Contests
        </h2>

        <div className="grid gap-6 md:grid-cols-2">

          {upcomingContests.map((contest) => (

            <div
              key={contest.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6 hover:border-indigo-500 transition"
            >

              <h3 className="text-xl font-semibold">
                {contest.title}
              </h3>

              <div className="mt-5 space-y-3 text-slate-400">

                <div className="flex items-center gap-2">
                  <CalendarDays size={18} />
                  {contest.date}
                </div>

                <div className="flex items-center gap-2">
                  <Clock3 size={18} />
                  {contest.duration}
                </div>

                <div className="flex items-center gap-2">
                  <Users size={18} />
                  {contest.participants} Registered
                </div>

              </div>

              <button className="mt-6 flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2 font-medium hover:bg-indigo-400 transition">

                Register

                <ArrowRight size={16} />

              </button>

            </div>

          ))}

        </div>

        {/* Past */}

        <h2 className="mt-14 mb-6 text-2xl font-bold">
          Past Contests
        </h2>

        <div className="overflow-hidden rounded-xl border border-slate-800">

          <table className="w-full">

            <thead className="bg-slate-900 text-slate-400">

              <tr>

                <th className="px-6 py-4 text-left">
                  Contest
                </th>

                <th className="text-left">
                  Winner
                </th>

                <th className="text-left">
                  Participants
                </th>

                <th></th>

              </tr>

            </thead>

            <tbody>

              {pastContests.map((contest) => (

                <tr
                  key={contest.id}
                  className="border-t border-slate-800 hover:bg-slate-900 transition"
                >

                  <td className="px-6 py-5 font-medium">
                    {contest.title}
                  </td>

                  <td className="text-yellow-400">
                    🏆 {contest.winner}
                  </td>

                  <td>{contest.participants}</td>

                  <td>

                    <button className="rounded-lg border border-slate-700 px-4 py-2 hover:bg-slate-800 transition">

                      View Results

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}