'use client';

export function MovieCardSkeleton() {
  return (
    <div className="w-40 md:w-44 flex-shrink-0">
      <div className="relative overflow-hidden rounded-lg aspect-[2/3] mb-2 skeleton" />
      <div className="space-y-2 px-1">
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-3 skeleton rounded w-1/2" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative h-screen min-h-[600px] skeleton">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
          <div className="max-w-2xl space-y-5">
            <div className="flex gap-2">
              <div className="h-8 skeleton rounded-full w-24" />
              <div className="h-8 skeleton rounded-full w-16" />
            </div>
            <div className="h-16 md:h-20 skeleton rounded w-2/3" />
            <div className="h-5 skeleton rounded w-1/3" />
            <div className="space-y-2">
              <div className="h-4 skeleton rounded w-full" />
              <div className="h-4 skeleton rounded w-5/6" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-12 skeleton rounded-lg w-36" />
              <div className="h-12 skeleton rounded-lg w-36" />
              <div className="h-12 skeleton rounded-lg w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CarouselSkeleton() {
  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="h-7 skeleton rounded w-48 mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
