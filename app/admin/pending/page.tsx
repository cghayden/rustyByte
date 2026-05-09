import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import db from '@/lib/db';
import { getQuarantineSignedUrl } from '@/lib/s3';
import { approveChallenge, rejectChallenge } from './actions';
import SubmitButton from '@/components/SubmitButton';

export default async function AdminPendingPage() {
  if (!(await isAdmin())) redirect('/dashboard');

  const pending = await db.challenge.findMany({
    where: { status: 'PENDING' },
    include: {
      author: { select: { username: true } },
      category: { select: { name: true } },
      questions: { orderBy: { id: 'asc' } },
      files: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // Generate signed URLs for any Dockerfiles
  const dockerfileUrls: Record<string, string> = {};
  for (const challenge of pending) {
    if (challenge.pendingDockerfilePath) {
      dockerfileUrls[challenge.id] = await getQuarantineSignedUrl(challenge.pendingDockerfilePath);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-neutral-200">Pending Challenges</h1>

      {pending.length === 0 && <p className="text-neutral-400">No challenges awaiting review.</p>}

      {pending.map((challenge) => (
        <div
          key={challenge.id}
          className="bg-stone-700 rounded-lg border border-stone-600 p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-100">{challenge.title}</h2>
              <p className="text-sm text-neutral-400">
                {challenge.category.name} &mdash; by{' '}
                <span className="text-accent">{challenge.author.username}</span>
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">
                Submitted {new Date(challenge.createdAt).toLocaleDateString()}
                {challenge.membersOnly && (
                  <span className="ml-2 px-1.5 py-0.5 bg-purple-900/50 text-purple-300 rounded text-xs">
                    Members only
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Prompt */}
          <div>
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
              Prompt
            </p>
            <p className="text-sm text-neutral-300 whitespace-pre-wrap">{challenge.prompt}</p>
          </div>

          {/* Questions */}
          <div>
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
              Questions ({challenge.questions.length})
            </p>
            <ul className="space-y-1">
              {challenge.questions.map((q) => (
                <li key={q.id} className="text-sm text-neutral-300">
                  <span className="font-medium">{q.challengeQuestion}</span>
                  <span className="text-neutral-500 ml-2">Answers: {q.answers.join(', ')}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dockerfile */}
          {challenge.pendingDockerfilePath && (
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                Dockerfile
              </p>
              <a
                href={dockerfileUrls[challenge.id]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline"
              >
                View Dockerfile (link expires in 15 min)
              </a>
            </div>
          )}

          {/* Challenge files */}
          {challenge.files.length > 0 && (
            <div>
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">
                Files ({challenge.files.length})
              </p>
              <ul className="text-sm text-neutral-300 space-y-0.5">
                {challenge.files.map((f) => (
                  <li key={f.id}>{f.filename}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Approve form */}
          <form action={approveChallenge} className="space-y-3 border-t border-stone-600 pt-4">
            <input type="hidden" name="challengeId" value={challenge.id} />

            {challenge.pendingDockerfilePath && (
              <p className="text-xs text-neutral-400">
                Image will be tagged{' '}
                <code className="text-accent">challenge-{challenge.slug}:latest</code>
                {' '}— run the build script on the server after approving.
              </p>
            )}

            <SubmitButton className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded focus:outline-none focus:ring-2 focus:ring-green-500">
              Approve & Activate
            </SubmitButton>
          </form>

          {/* Reject form */}
          <form action={rejectChallenge} className="space-y-2">
            <input type="hidden" name="challengeId" value={challenge.id} />
            <textarea
              name="rejectionNote"
              required
              rows={2}
              placeholder="Rejection reason (required)..."
              className="w-full px-2 py-1.5 bg-stone-800 border border-stone-500 rounded text-neutral-200 text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <SubmitButton className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-sm font-medium rounded focus:outline-none focus:ring-2 focus:ring-red-500">
              Reject
            </SubmitButton>
          </form>
        </div>
      ))}
    </div>
  );
}
