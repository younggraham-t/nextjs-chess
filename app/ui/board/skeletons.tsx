// Loading animation
// const shimmer =
//   'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function BoardSkeleton() {
    return (
        <div className={`w-[480px] h-[480px] bg-board bg-cover`}>
        </div>
    )
}
