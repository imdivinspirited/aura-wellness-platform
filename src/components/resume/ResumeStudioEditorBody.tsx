/**
 * Editor surface for Resume Studio (accordion + footer note).
 */

import type { Dispatch, SetStateAction } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ResumeDocumentV1 } from "@/lib/resume/types";
import { ResumeStudioProofControls } from "@/components/resume/ResumeStudioProofControls";
import {
  moveDown,
  moveUp,
  newCertificationItem,
  newCustomSection,
  newEducationItem,
  newExperienceItem,
  newLanguageItem,
  newProjectItem,
  newSkillGroup,
} from "@/lib/resume/engine";

const ACC_ITEM =
  "overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/95 via-card/80 to-muted/25 px-1 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md data-[state=open]:border-primary/30 data-[state=open]:shadow-[0_12px_40px_-16px_hsl(var(--primary)/0.2)] dark:ring-white/[0.04] dark:data-[state=open]:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45)]";
const ACC_TRIGGER =
  "text-left hover:no-underline py-4 font-display text-[15px] font-semibold tracking-tight text-foreground/95 transition-colors hover:text-foreground data-[state=open]:text-primary";

function visRow(
  label: string,
  key: keyof ResumeDocumentV1["visibility"],
  doc: ResumeDocumentV1,
  set: (d: ResumeDocumentV1) => void
) {
  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-gradient-to-r from-background/80 to-muted/15 px-3 py-2.5 transition-colors hover:border-primary/25">
      <span className="text-sm font-medium text-foreground/90">{label}</span>
      <Switch
        checked={doc.visibility[key]}
        onCheckedChange={(v) => set({ ...doc, visibility: { ...doc.visibility, [key]: v } })}
      />
    </div>
  );
}

export interface ResumeStudioEditorBodyProps {
  doc: ResumeDocumentV1;
  setDoc: Dispatch<SetStateAction<ResumeDocumentV1>>;
}

export function ResumeStudioEditorBody({ doc, setDoc }: ResumeStudioEditorBodyProps) {
  return (
    <>
      <Accordion type="multiple" defaultValue={['head', 'exp', 'vis']} className="space-y-2">
        <AccordionItem value="head" className={ACC_ITEM}>
          <AccordionTrigger className={ACC_TRIGGER}>Headline & summary</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="rs-headline">Professional headline</Label>
              <Input
                id="rs-headline"
                value={doc.headline}
                onChange={(e) => setDoc({ ...doc, headline: e.target.value })}
                placeholder="e.g. Senior Yoga Educator · Program Lead"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rs-summary">Summary</Label>
              <Textarea
                id="rs-summary"
                rows={6}
                value={doc.summary}
                onChange={(e) => setDoc({ ...doc, summary: e.target.value })}
                placeholder="3–5 sentences: scope, strengths, impact, and what you seek next."
                className="min-h-[140px] resize-y"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="social" className={ACC_ITEM}>
          <AccordionTrigger className={ACC_TRIGGER}>Links & social</AccordionTrigger>
          <AccordionContent className="grid gap-3 sm:grid-cols-2 pb-4">
            {(
              [
                ['linkedin', 'LinkedIn URL'],
                ['github', 'GitHub URL'],
                ['portfolio', 'Portfolio / website'],
                ['twitter', 'X / Twitter'],
                ['other', 'Other link'],
              ] as const
            ).map(([k, lab]) => (
              <div key={k} className="space-y-1.5">
                <Label className="text-xs">{lab}</Label>
                <Input
                  value={doc.social[k]}
                  onChange={(e) => setDoc({ ...doc, social: { ...doc.social, [k]: e.target.value } })}
                  placeholder="https://"
                />
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="exp" className={ACC_ITEM}>
          <AccordionTrigger className={ACC_TRIGGER}>Experience</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            {doc.experience.map((ex, i) => (
              <Card key={ex.id} className="rounded-2xl border border-border/45 bg-gradient-to-br from-muted/50 to-muted/10 shadow-sm">
                <CardHeader className="py-3 space-y-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">Role {i + 1}</CardTitle>
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDoc({ ...doc, experience: moveUp(doc.experience, i) })}>
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDoc({ ...doc, experience: moveDown(doc.experience, i) })}>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDoc({ ...doc, experience: doc.experience.filter((_, j) => j !== i) })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Title</Label>
                      <Input value={ex.title} onChange={(e) => {
                        const experience = [...doc.experience];
                        experience[i] = { ...ex, title: e.target.value };
                        setDoc({ ...doc, experience });
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Company</Label>
                      <Input value={ex.company} onChange={(e) => {
                        const experience = [...doc.experience];
                        experience[i] = { ...ex, company: e.target.value };
                        setDoc({ ...doc, experience });
                      }} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Location</Label>
                      <Input value={ex.location} onChange={(e) => {
                        const experience = [...doc.experience];
                        experience[i] = { ...ex, location: e.target.value };
                        setDoc({ ...doc, experience });
                      }} />
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="space-y-1.5 flex-1 min-w-[8rem]">
                        <Label className="text-xs">Start</Label>
                        <Input type="month" value={ex.start?.slice(0, 7) || ''} onChange={(e) => {
                          const experience = [...doc.experience];
                          experience[i] = { ...ex, start: e.target.value ? `${e.target.value}-01` : '' };
                          setDoc({ ...doc, experience });
                        }} />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-[8rem]">
                        <Label className="text-xs">End</Label>
                        <Input type="month" disabled={ex.current} value={ex.end?.slice(0, 7) || ''} onChange={(e) => {
                          const experience = [...doc.experience];
                          experience[i] = { ...ex, end: e.target.value ? `${e.target.value}-01` : '' };
                          setDoc({ ...doc, experience });
                        }} />
                      </div>
                      <label className="flex items-center gap-2 text-sm pb-1">
                        <Checkbox checked={ex.current} onCheckedChange={(v) => {
                          const experience = [...doc.experience];
                          experience[i] = { ...ex, current: !!v, end: v ? '' : ex.end };
                          setDoc({ ...doc, experience });
                        }} />
                        Current
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Role summary</Label>
                    <Textarea rows={2} value={ex.summary} onChange={(e) => {
                      const experience = [...doc.experience];
                      experience[i] = { ...ex, summary: e.target.value };
                      setDoc({ ...doc, experience });
                    }} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Impact bullets</Label>
                    {ex.bullets.map((b, bi) => (
                      <div key={bi} className="flex gap-2">
                        <Input value={b} onChange={(e) => {
                          const bullets = [...ex.bullets];
                          bullets[bi] = e.target.value;
                          const experience = [...doc.experience];
                          experience[i] = { ...ex, bullets };
                          setDoc({ ...doc, experience });
                        }} />
                        <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => {
                          const bullets = ex.bullets.filter((_, j) => j !== bi);
                          const experience = [...doc.experience];
                          experience[i] = { ...ex, bullets };
                          setDoc({ ...doc, experience });
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" size="sm" onClick={() => {
                      const experience = [...doc.experience];
                      experience[i] = { ...ex, bullets: [...ex.bullets, ''] };
                      setDoc({ ...doc, experience });
                    }}>
                      <Plus className="h-4 w-4 mr-1" /> Add bullet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={() => setDoc({ ...doc, experience: [...doc.experience, newExperienceItem()] })}>
              <Plus className="h-4 w-4 mr-2" /> Add experience
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="edu" className={ACC_ITEM}>
          <AccordionTrigger className={ACC_TRIGGER}>Education</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            {doc.education.map((ed, i) => (
              <Card key={ed.id} className="space-y-3 rounded-2xl border border-border/45 bg-gradient-to-br from-muted/50 to-muted/10 p-4 shadow-sm">
                <div className="flex justify-end gap-1">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDoc({ ...doc, education: moveUp(doc.education, i) })}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDoc({ ...doc, education: moveDown(doc.education, i) })}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDoc({ ...doc, education: doc.education.filter((_, j) => j !== i) })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="School" value={ed.school} onChange={(e) => {
                    const education = [...doc.education];
                    education[i] = { ...ed, school: e.target.value };
                    setDoc({ ...doc, education });
                  }} />
                  <Input placeholder="Degree" value={ed.degree} onChange={(e) => {
                    const education = [...doc.education];
                    education[i] = { ...ed, degree: e.target.value };
                    setDoc({ ...doc, education });
                  }} />
                  <Input placeholder="Field" value={ed.field} onChange={(e) => {
                    const education = [...doc.education];
                    education[i] = { ...ed, field: e.target.value };
                    setDoc({ ...doc, education });
                  }} />
                  <div className="flex gap-2">
                    <Input type="month" className="flex-1" value={ed.start?.slice(0, 7) || ''} onChange={(e) => {
                      const education = [...doc.education];
                      education[i] = { ...ed, start: e.target.value ? `${e.target.value}-01` : '' };
                      setDoc({ ...doc, education });
                    }} />
                    <Input type="month" className="flex-1" value={ed.end?.slice(0, 7) || ''} onChange={(e) => {
                      const education = [...doc.education];
                      education[i] = { ...ed, end: e.target.value ? `${e.target.value}-01` : '' };
                      setDoc({ ...doc, education });
                    }} />
                  </div>
                </div>
                <Textarea placeholder="Details, honors, coursework" value={ed.details} onChange={(e) => {
                  const education = [...doc.education];
                  education[i] = { ...ed, details: e.target.value };
                  setDoc({ ...doc, education });
                }} />
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={() => setDoc({ ...doc, education: [...doc.education, newEducationItem()] })}>
              <Plus className="h-4 w-4 mr-2" /> Add education
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="proj" className={ACC_ITEM}>
          <AccordionTrigger className={ACC_TRIGGER}>Projects</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            {doc.projects.map((p, i) => (
              <Card key={p.id} className="space-y-2 rounded-2xl border border-border/45 bg-gradient-to-br from-muted/50 to-muted/10 p-4 shadow-sm">
                <div className="flex justify-end">
                  <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setDoc({ ...doc, projects: doc.projects.filter((_, j) => j !== i) })}>
                    Remove
                  </Button>
                </div>
                <Input placeholder="Name" value={p.name} onChange={(e) => {
                  const projects = [...doc.projects];
                  projects[i] = { ...p, name: e.target.value };
                  setDoc({ ...doc, projects });
                }} />
                <Input placeholder="URL" value={p.url} onChange={(e) => {
                  const projects = [...doc.projects];
                  projects[i] = { ...p, url: e.target.value };
                  setDoc({ ...doc, projects });
                }} />
                <Textarea placeholder="Summary" value={p.summary} onChange={(e) => {
                  const projects = [...doc.projects];
                  projects[i] = { ...p, summary: e.target.value };
                  setDoc({ ...doc, projects });
                }} />
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={() => setDoc({ ...doc, projects: [...doc.projects, newProjectItem()] })}>
              <Plus className="h-4 w-4 mr-2" /> Add project
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cert" className={ACC_ITEM}>
          <AccordionTrigger className={ACC_TRIGGER}>Certifications</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            {doc.certifications.map((c, i) => (
              <div key={c.id} className="grid gap-2 sm:grid-cols-2 border rounded-md p-3">
                <Input placeholder="Name" value={c.name} onChange={(e) => {
                  const certifications = [...doc.certifications];
                  certifications[i] = { ...c, name: e.target.value };
                  setDoc({ ...doc, certifications });
                }} />
                <Input placeholder="Issuer" value={c.issuer} onChange={(e) => {
                  const certifications = [...doc.certifications];
                  certifications[i] = { ...c, issuer: e.target.value };
                  setDoc({ ...doc, certifications });
                }} />
                <Input type="month" value={c.date?.slice(0, 7) || ''} onChange={(e) => {
                  const certifications = [...doc.certifications];
                  certifications[i] = { ...c, date: e.target.value ? `${e.target.value}-01` : '' };
                  setDoc({ ...doc, certifications });
                }} />
                <Input placeholder="Credential ID" value={c.credentialId} onChange={(e) => {
                  const certifications = [...doc.certifications];
                  certifications[i] = { ...c, credentialId: e.target.value };
                  setDoc({ ...doc, certifications });
                }} />
                <Button type="button" variant="ghost" size="sm" className="sm:col-span-2 text-destructive" onClick={() => setDoc({ ...doc, certifications: doc.certifications.filter((_, j) => j !== i) })}>
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setDoc({ ...doc, certifications: [...doc.certifications, newCertificationItem()] })}>
              <Plus className="h-4 w-4 mr-2" /> Add certification
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="lang" className={ACC_ITEM}>
          <AccordionTrigger className={ACC_TRIGGER}>Languages</AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            {doc.languages.map((l, i) => (
              <div key={l.id} className="flex gap-2">
                <Input placeholder="Language" value={l.name} onChange={(e) => {
                  const languages = [...doc.languages];
                  languages[i] = { ...l, name: e.target.value };
                  setDoc({ ...doc, languages });
                }} />
                <Input placeholder="Level" className="max-w-[10rem]" value={l.proficiency} onChange={(e) => {
                  const languages = [...doc.languages];
                  languages[i] = { ...l, proficiency: e.target.value };
                  setDoc({ ...doc, languages });
                }} />
                <Button type="button" variant="ghost" size="icon" onClick={() => setDoc({ ...doc, languages: doc.languages.filter((_, j) => j !== i) })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => setDoc({ ...doc, languages: [...doc.languages, newLanguageItem()] })}>
              <Plus className="h-4 w-4 mr-2" /> Add language
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="skills" className={ACC_ITEM}>
          <AccordionTrigger className={ACC_TRIGGER}>Skill groups</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            {doc.skillGroups.map((g, gi) => (
              <Card key={g.id} className="space-y-2 rounded-2xl border border-border/45 bg-gradient-to-br from-muted/50 to-muted/10 p-4 shadow-sm">
                <Input placeholder="Group label (e.g. Teaching)" value={g.label} onChange={(e) => {
                  const skillGroups = [...doc.skillGroups];
                  skillGroups[gi] = { ...g, label: e.target.value };
                  setDoc({ ...doc, skillGroups });
                }} />
                <Textarea
                  placeholder="Comma-separated skills"
                  value={g.items.join(', ')}
                  onChange={(e) => {
                    const skillGroups = [...doc.skillGroups];
                    skillGroups[gi] = {
                      ...g,
                      items: e.target.value
                        .split(/[,;]/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                    };
                    setDoc({ ...doc, skillGroups });
                  }}
                />
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setDoc({ ...doc, skillGroups: doc.skillGroups.filter((_, j) => j !== gi) })}>
                  Remove group
                </Button>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={() => setDoc({ ...doc, skillGroups: [...doc.skillGroups, newSkillGroup()] })}>
              <Plus className="h-4 w-4 mr-2" /> Add skill group
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="custom" className={ACC_ITEM}>
          <AccordionTrigger className={ACC_TRIGGER}>Custom sections</AccordionTrigger>
          <AccordionContent className="space-y-4 pb-4">
            {doc.customSections.map((cs, i) => (
              <Card key={cs.id} className="space-y-2 rounded-2xl border border-border/45 bg-gradient-to-br from-muted/50 to-muted/10 p-4 shadow-sm">
                <Input placeholder="Section title" value={cs.title} onChange={(e) => {
                  const customSections = [...doc.customSections];
                  customSections[i] = { ...cs, title: e.target.value };
                  setDoc({ ...doc, customSections });
                }} />
                <Textarea rows={4} placeholder="Content" value={cs.body} onChange={(e) => {
                  const customSections = [...doc.customSections];
                  customSections[i] = { ...cs, body: e.target.value };
                  setDoc({ ...doc, customSections });
                }} />
                <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setDoc({ ...doc, customSections: doc.customSections.filter((_, j) => j !== i) })}>
                  Remove section
                </Button>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={() => setDoc({ ...doc, customSections: [...doc.customSections, newCustomSection()] })}>
              <Plus className="h-4 w-4 mr-2" /> Add custom section
            </Button>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vis" className={ACC_ITEM}>
          <AccordionTrigger className={ACC_TRIGGER}>Visibility in PDF</AccordionTrigger>
          <AccordionContent className="grid gap-2 sm:grid-cols-2 pb-4">
            {visRow('Headline', 'headline', doc, setDoc)}
            {visRow('Summary', 'summary', doc, setDoc)}
            {visRow('Social links', 'social', doc, setDoc)}
            {visRow('Experience', 'experience', doc, setDoc)}
            {visRow('Education', 'education', doc, setDoc)}
            {visRow('Projects', 'projects', doc, setDoc)}
            {visRow('Certifications', 'certifications', doc, setDoc)}
            {visRow('Languages', 'languages', doc, setDoc)}
            {visRow('Skills', 'skills', doc, setDoc)}
            {visRow('Custom sections', 'custom', doc, setDoc)}
            {visRow('Profile tab details', 'profileDetails', doc, setDoc)}
            {visRow('Achievements (Activities)', 'achievements', doc, setDoc)}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="pt-2">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[10px] sm:tracking-[0.28em]">
          Print &amp; layout
        </p>
        <ResumeStudioProofControls doc={doc} setDoc={setDoc} />
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-border/70 to-transparent" />

      <p className="rounded-2xl border border-dashed border-border/50 bg-muted/25 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        Activities → Achievements still sync from the Activities tab. Structured sections are saved as{' '}
        <code className="rounded-md bg-background/80 px-1.5 py-0.5 font-mono text-[11px] text-foreground/90 ring-1 ring-border/60">
          resume_document
        </code>{' '}
        on your profile.
      </p>

    </>
  );
}
