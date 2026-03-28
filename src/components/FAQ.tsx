
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What is The Love Hub?",
    answer: "The Love Hub is a platform that connects project owners with potential contributors. It focuses specifically on projects built with Lovable, allowing developers to discover projects they can contribute to, and project owners to find talented contributors to help their projects grow."
  },
  {
    question: "How does the voting system work?",
    answer: "You start with 3 base votes to distribute among projects. Each day you can claim 2 bonus votes to keep supporting the community. Votes help determine which projects get featured and prioritized. You can redistribute your votes at any time by removing a vote from one project and giving it to another."
  },
  {
    question: "How can I contribute to a project?",
    answer: "Browse the list of available projects and find one that interests you. Each project page contains contact information, project goals, and specific areas where help is needed. Reach out to the project owner directly to start contributing."
  },
  {
    question: "Can I add my own project to the platform?",
    answer: "Yes! Click 'Add Project' in the navigation menu, fill out the project details form, and submit. Your project will be visible to potential contributors immediately. You can edit your project details anytime from the 'My Projects' page."
  },
  {
    question: "What information should I include about my project?",
    answer: "Include a compelling title and description, the Lovable project URL, your contact information, the project's goals, specific areas where you need help, and relevant tags. The more detail you provide, the easier it is for potential contributors to decide if your project is a good fit."
  },
  {
    question: "Is this platform only for Lovable projects?",
    answer: "Yes, this platform is specifically designed for projects built with Lovable. This focus allows us to create a more tailored experience for both project owners and contributors who are familiar with the Lovable ecosystem."
  },
  {
    question: "How do I update my project?",
    answer: "Go to 'My Projects' from the navigation menu, find the project you want to update, and click 'Edit'. You can modify any of your project details including description, tags, contact info, and project image."
  }
];

const FAQ = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about The Love Hub and how to get involved with Lovable projects.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
