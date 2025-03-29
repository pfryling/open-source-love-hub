
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What is Open Source Love Hub?",
    answer: "Open Source Love Hub is a platform that connects open source project owners with potential contributors. It focuses specifically on projects built with Lovable, allowing developers to discover projects they can contribute to, and project owners to find talented contributors to help their projects grow."
  },
  {
    question: "How can I contribute to a project?",
    answer: "To contribute to a project, browse the list of available projects, find one that interests you, and click on it to view details. Each project page contains information about how to get in touch with the project owner, the project's goals, and specific areas where help is needed. You can then reach out to the project owner using the contact information provided."
  },
  {
    question: "Can I add my own project to the platform?",
    answer: "Yes! If you have a Lovable project that you'd like to get more contributors for, you can add it to our platform. Simply click on 'Add Project' in the navigation menu, fill out the project details form, and submit it. Your project will then be visible to potential contributors."
  },
  {
    question: "What information should I include about my project?",
    answer: "When adding your project, be sure to include a compelling title and description, the Lovable project URL, your contact information, the project's goals, specific areas where you need help, and relevant tags to help contributors find your project. The more detailed information you provide, the easier it will be for potential contributors to understand what you're looking for."
  },
  {
    question: "Is this platform only for Lovable projects?",
    answer: "Yes, this platform is specifically designed for projects built with Lovable. This focus allows us to create a more tailored experience for both project owners and contributors who are familiar with the Lovable ecosystem."
  },
  {
    question: "How do I update information about my project?",
    answer: "Currently, if you need to update information about your project, please reach out to us directly. We're working on adding a self-service feature for project owners to update their own project information."
  },
  {
    question: "What types of skills are project owners looking for?",
    answer: "Project owners may be looking for a variety of skills including frontend development, UI/UX design, content creation, testing, and more. Each project page specifies the particular skills and areas where help is needed."
  }
];

const FAQ = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about Open Source Love Hub and how to get involved with Lovable projects.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">{item.answer}</p>
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
