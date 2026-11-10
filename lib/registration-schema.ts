import { z } from 'zod';

const email = z.string().trim().email().max(254);
const github = z.string().trim().max(39).regex(/^[A-Za-z0-9-]*$/, 'Use a valid GitHub username.').optional().or(z.literal(''));
const memberSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email,
  githubUsername: github,
});

export const registrationInputSchema = z.object({
  leaderName: z.string().trim().min(2).max(120),
  leaderEmail: email,
  leaderPhone: z.string().trim().min(7).max(20).regex(/^[+0-9() .-]+$/),
  leaderGithubUsername: github,
  teams: z.array(z.object({
    teamName: z.string().trim().min(2).max(100),
    institution: z.string().trim().min(2).max(180),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    domainId: z.string().uuid(),
    challengeId: z.string().min(2).max(100),
    members: z.array(memberSchema),
    repositoryUrl: z.string().trim().url().max(500).or(z.literal('')),
    rulesAccepted: z.literal(true),
  })).min(1).max(5),
}).superRefine((values, ctx) => {
  const domainIds=values.teams.map(team=>team.domainId);
  if(new Set(domainIds).size!==domainIds.length)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Use a separate domain only once in this registration.',path:['teams']});
  values.teams.forEach((team,index)=>{
    const emails=[values.leaderEmail,...team.members.map(member=>member.email)].map(value=>value.toLowerCase());
    if(new Set(emails).size!==emails.length)ctx.addIssue({code:z.ZodIssueCode.custom,message:'Each team must use unique member email addresses.',path:['teams',index,'members']});
    if(team.repositoryUrl&&!/^https:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/i.test(team.repositoryUrl))ctx.addIssue({code:z.ZodIssueCode.custom,message:'Enter a valid GitHub repository URL.',path:['teams',index,'repositoryUrl']});
  });
});

export type RegistrationInput = z.infer<typeof registrationInputSchema>;
