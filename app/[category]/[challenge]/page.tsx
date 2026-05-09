import { getChallenge, getCategoryById } from '@/lib/db';
import { getCurrentUserWithRole } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AnswerCard from '@/components/AnswerCard';
import DownloadButton from '@/components/DownloadButton';
import TerminalInstance from '@/components/TerminalInstance';

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ category: string; challenge: string }>;
}) {
  const { category, challenge } = await params;
  const [categoryData, challengeData, currentUser] = await Promise.all([
    getCategoryById(category),
    getChallenge(category, challenge),
    getCurrentUserWithRole(),
  ]);

  if (!categoryData || !challengeData) return notFound();

  const isAdmin = currentUser?.role === 'ADMIN';
  const isAuthor = currentUser?.userId === challengeData.authorId;

  // Non-ACTIVE challenges: admins see everything, authors see their own pending/rejected
  if (challengeData.status !== 'ACTIVE') {
    if (!isAdmin && !isAuthor) return notFound();

    // Show pending/rejected status page to author (and admin)
    return (
      <div className="space-y-4 max-w-200">
        <h1 className="text-xl font-semibold text-neutral-300">{challengeData.title}</h1>
        {challengeData.status === 'PENDING' && (
          <div className="p-4 rounded-lg bg-yellow-900/30 border border-yellow-600/40 text-yellow-300">
            <p className="font-semibold">Awaiting admin review</p>
            <p className="text-sm mt-1 text-yellow-400/80">
              This challenge is pending approval. It will become visible to other users once an
              admin activates it.
            </p>
          </div>
        )}
        {challengeData.status === 'REJECTED' && (
          <div className="p-4 rounded-lg bg-red-900/30 border border-red-600/40 text-red-300">
            <p className="font-semibold">Challenge rejected</p>
            {challengeData.rejectionNote && (
              <p className="text-sm mt-1 text-red-400/80">
                <span className="font-medium">Reason:</span> {challengeData.rejectionNote}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Guard members-only challenges
  if (challengeData.membersOnly) {
    const role = currentUser?.role;
    if (role !== 'ADMIN' && role !== 'BCC_CTFCLUB') return notFound();
  }

  // Check if current user can edit challenges
  const userCanEdit =
    currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'AUTHOR');

  return (
    <div id="challenge-content" className="space-y-4 max-w-200">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-neutral-300">{challengeData.title}</h1>
        {/* Only show edit button for ADMIN and AUTHOR roles */}
        {userCanEdit && (
          <div className="flex items-center gap-4">
            <a
              href={`/${category}/${challenge}/edit`}
              className="px-3 py-1 text-xs bg-accent text-tavern-dark rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit Challenge
            </a>
          </div>
        )}
      </div>

      {/* Challenge Prompt Section */}
      {challengeData.prompt && (
        <div>
          <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {challengeData.prompt}
          </p>
        </div>
      )}

      {/* Challenge Files Section */}
      {challengeData.files && challengeData.files.length > 0 && (
        <div className="p-4">
          <h2 className="font-medium text-neutral-300">Challenge Files</h2>
          <div className="">
            {challengeData.files.map((file, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 p-3 bg-tavern-secondary/10 rounded-xl"
              >
                <DownloadButton fileId={file.id} filename={file.name || file.filename} />
                {file.description && (
                  <div className="text-xs text-neutral-300/60">{file.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Instance Section - Only show if challenge has a Docker image */}
      {challengeData.dockerImage && currentUser && (
        <div className="p-4">
          <h2 className="font-medium text-neutral-300 mb-4">Terminal Challenge</h2>
          <TerminalInstance userId={currentUser.userId} challengeId={challengeData.id} />
        </div>
      )}

      {/* Show login prompt if user is not authenticated but challenge requires terminal */}
      {challengeData.dockerImage && !currentUser && (
        <div className="p-4">
          <h2 className="font-medium text-neutral-300 mb-4">Terminal Challenge</h2>
          <div className="p-4 bg-yellow-600/20 border border-yellow-600/40 rounded-lg">
            <p className="text-yellow-300 mb-2">
              This challenge requires a terminal session. Please log in to access the terminal.
            </p>
            <Link
              href="/login"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Log In
            </Link>
          </div>
        </div>
      )}

      {challengeData.questions.map((q) => (
        <AnswerCard
          key={q.id}
          categoryId={categoryData.id}
          challengeSlug={challengeData.slug}
          questionId={q.questionId}
          challengeQuestion={q.challengeQuestion}
        />
      ))}
    </div>
  );
}
