import { ArrowRightIcon } from '@phosphor-icons/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Link } from '@/components/Link'
import { PublicBookmarkItem } from '@/components/PublicBookmarkItem'
import type { Bookmark } from '@/types/db'
import { getRecentPublicBookmarksOptions } from '@/utils/fetching/recentPublicBookmarks'
import { useSession } from '../../components/AuthProvider'
import { ROUTE_HOME, ROUTE_RECENT, ROUTE_SIGNIN } from '../../constants'

// Personal instance: how many public bookmarks to show on the landing page.
const PUBLIC_LIMIT = 30

export const Route = createFileRoute('/_public/')({
  component: Index,
  loader: async ({ context }) => {
    if (context.session !== null) {
      throw redirect({ to: ROUTE_HOME })
    }
    await context.queryClient.ensureQueryData(
      getRecentPublicBookmarksOptions({ limit: PUBLIC_LIMIT }),
    )
  },
})

function Index() {
  const navigate = useNavigate()
  const session = useSession()

  if (session) {
    navigate({ to: ROUTE_HOME })
  }

  const { data: recentBookmarks } = useSuspenseQuery(
    getRecentPublicBookmarksOptions({ limit: PUBLIC_LIMIT }),
  )

  return (
    <>
      {/* ---- Personalise this header ---- */}
      <section className="landing-hero landing-container">
        <img
          className="mx-auto"
          src="/otter-logo.svg"
          width="72"
          height="72"
          alt=""
        />
        <h1 className="landing-display">Public bookmarks</h1>
        <p className="landing-lede">Links worth keeping.</p>
        <div className="landing-cta-row">
          <a href={ROUTE_SIGNIN} className="landing-btn">
            Sign in
            <ArrowRightIcon weight="bold" width="16" height="16" />
          </a>
        </div>
      </section>

      {recentBookmarks.data?.length ? (
        <section className="landing-clippings">
          <div className="landing-container">
            <div className="landing-clippings-grid">
              {recentBookmarks.data.map((item: Bookmark) => (
                <div className="landing-clipping" key={item.id}>
                  <PublicBookmarkItem {...item} />
                </div>
              ))}
            </div>
            <div className="landing-clippings-more">
              <Link href={ROUTE_RECENT} className="landing-btn">
                All public bookmarks
                <ArrowRightIcon weight="bold" width="16" height="16" />
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="landing-container">
          <p className="landing-lede">No public bookmarks yet.</p>
        </section>
      )}
    </>
  )
}
