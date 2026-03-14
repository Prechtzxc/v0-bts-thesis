"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// NOTE: FAQs should be fetched from Supabase faqs table
// For now, use sample data - implement real backend connection when ready
const faqs = [
  {
    question: "Who is eligible to apply for the scholarship?",
    answer: "High school graduates and current college students who meet our academic and financial criteria are eligible to apply. Visit our eligibility page for detailed requirements.",
  },
  {
    question: "What is the application deadline?",
    answer: "The application deadline for 2025 is December 31st. We review applications on a rolling basis, so apply early for better chances.",
  },
  {
    question: "How much financial aid do scholars receive?",
    answer: "Scholarship amounts vary based on demonstrated need and academic merit. Most scholars receive between 50-100% of tuition costs.",
  },
  {
    question: "Can I reapply if I was not selected?",
    answer: "Yes, you can reapply in the next cycle. We encourage applicants to strengthen their applications and try again.",
  },
]

export function FaqSection() {
  return (
    <section className="relative w-full bg-white py-16 md:py-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-green-50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-50 to-transparent"></div>

        {/* Decorative circles */}
        <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-green-100 to-emerald-50 opacity-70 blur-3xl"></div>
        <div className="absolute -right-20 bottom-1/3 h-64 w-64 rounded-full bg-gradient-to-tr from-teal-100 to-green-50 opacity-70 blur-3xl"></div>
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-1.5 text-sm font-medium text-green-800 shadow-md">
              Got Questions?
            </div>
            <h2 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-green-800 via-green-600 to-emerald-600 bg-clip-text text-transparent sm:text-4xl md:text-5xl">
              Frequently Asked Questions
            </h2>
            <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed">
              Find answers to common questions about our scholarship program.
            </p>
          </div>
        </div>

        <div className="relative mx-auto max-w-3xl py-12">
          {/* Decorative elements */}
          <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-green-200 to-emerald-100 opacity-30 blur-xl"></div>
          <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-gradient-to-tr from-teal-200 to-green-100 opacity-30 blur-xl"></div>

          {/* FAQ accordion */}
          <div className="relative rounded-2xl border border-green-100 bg-white/80 backdrop-blur-sm p-6 shadow-xl">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="group border-b border-green-100 last:border-0"
                >
                  <AccordionTrigger className="text-left text-green-900 hover:text-green-700 hover:no-underline">
                    <span className="flex items-center">
                      <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-50 text-xs font-medium text-green-800 shadow-sm group-data-[state=open]:bg-gradient-to-br group-data-[state=open]:from-green-500 group-data-[state=open]:to-emerald-400 group-data-[state=open]:text-white">
                        {index + 1}
                      </span>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pl-10">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
