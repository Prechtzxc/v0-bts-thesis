"use client"

export function TestimonialsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700 py-16 md:py-24">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-200/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-200/20 to-transparent"></div>

        {/* Animated circles */}
        <div className="animate-pulse-slow absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-gradient-to-br from-green-400 to-teal-300 opacity-10 blur-3xl"></div>
        <div className="animate-pulse-slow absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400 to-green-300 opacity-10 blur-3xl"></div>

        {/* Mesh pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAzMGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptLTMwLTE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2em0wIDMwYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2eiIgc3Ryb2tlPSIjMTY4MDNkIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-full bg-gradient-to-r from-green-200/20 to-emerald-200/20 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-green-100 shadow-lg">
              Success Stories
            </div>
            <h2 className="text-3xl font-bold tracking-tighter text-white drop-shadow-md sm:text-4xl md:text-5xl">
              Hear From Our{" "}
              <span className="bg-gradient-to-r from-green-200 to-emerald-100 bg-clip-text text-transparent">
                Scholars
              </span>
            </h2>
            <p className="max-w-[900px] text-green-100 md:text-xl/relaxed">
              Our scholarship program has helped hundreds of students achieve their dreams.
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Testimonials will be loaded from Supabase when backend is ready */}
          <div className="text-center col-span-full text-green-100 py-12">
            <p>Loading testimonials from our database...</p>
          </div>
        </div>
      </div>
    </section>
  )
}
