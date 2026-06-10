export const uid = () => Math.random().toString(36).slice(2, 9);

export const emptyCV = () => ({
  fullName: "", title: "", photo: "",
  email: "", phone: "", location: "",
  website: "", linkedin: "", github: "", portfolio: "",
  customLinks: [],
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  volunteer: [],
  customSections: [],
});

export const sampleCV = () => ({
  ...emptyCV(),
  fullName: "Sarah Mitchell",
  title: "Senior Product Designer",
  email: "sarah.mitchell@email.com",
  phone: "+44 7911 234 567",
  location: "London, UK",
  website: "sarahmitchell.design",
  linkedin: "linkedin.com/in/sarahmitchell",
  github: "github.com/sarahmitchell",
  summary:
    "Product designer with 6 years of experience turning complex problems into clean, user-tested interfaces. Led design for products used by over 2 million people across fintech and SaaS. Strong on systems thinking, Figma, and working closely with engineering teams.",
  skills: [
    "Figma", "UX Research", "Prototyping", "Design Systems",
    "Usability Testing", "Accessibility (WCAG)", "React", "CSS",
    "Product Strategy", "Stakeholder Communication",
  ],
  experience: [
    {
      id: uid(),
      company: "Monzo Bank",
      position: "Senior Product Designer",
      start: "Mar 2022",
      end: "Present",
      current: true,
      description: "Lead designer for the personal finance and budgeting product area, serving 2M+ active users.",
      achievements:
        "Redesigned the budgeting feature, increasing weekly engagement by 34%.\nReduced onboarding drop-off by 22% through iterative usability testing across 5 rounds.\nBuilt and maintained a component library of 120+ tokens used across 4 squads.\nMentored 2 junior designers and ran bi-weekly design critique sessions.",
    },
    {
      id: uid(),
      company: "Typeform",
      position: "Product Designer",
      start: "Jun 2020",
      end: "Feb 2022",
      current: false,
      description: "Owned design for the form builder and response analytics tools.",
      achievements:
        "Shipped a drag-and-drop form builder redesign that cut creation time by 40%.\nConducted 60+ user interviews to define a 12-month research roadmap.\nCollaborated with engineers to reduce design-to-production drift to near zero.",
    },
    {
      id: uid(),
      company: "Freelance",
      position: "UX Designer",
      start: "Jan 2019",
      end: "May 2020",
      current: false,
      description: "Worked with startups and agencies on early-stage product design and brand identity.",
      achievements:
        "Delivered end-to-end design for 8 client projects across mobile and web.\nIncreased a client's app store rating from 3.1 to 4.6 through UX improvements.",
    },
  ],
  education: [
    {
      id: uid(),
      institution: "University of the Arts London",
      degree: "BA (Hons)",
      field: "Graphic & Digital Design",
      start: "2015",
      end: "2018",
      description: "First-class honours. Dissertation on human-centred design in financial services.",
    },
  ],
  projects: [
    {
      id: uid(),
      name: "OpenPalette",
      description: "Open-source accessible colour palette generator for designers. 4,000+ monthly users.",
      technologies: "React, TypeScript, WCAG 2.1",
      github: "github.com/sarahmitchell/openpalette",
      demo: "openpalette.design",
    },
  ],
  certifications: [
    {
      id: uid(),
      name: "Nielsen Norman Group UX Certification",
      org: "NN/g",
      date: "2021",
      url: "",
    },
  ],
  languages: [
    { id: uid(), name: "English", level: "Native" },
    { id: uid(), name: "French", level: "Conversational" },
  ],
});
