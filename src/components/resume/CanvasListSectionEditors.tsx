/**
 * Inline add/edit for resume list sections on the live canvas (no “open editor” dependency).
 */

import type { Dispatch, SetStateAction } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { ResumeDocumentV1 } from '@/lib/resume/types';
import {
  newCertificationItem,
  newCustomSection,
  newEducationItem,
  newLanguageItem,
  newProjectItem,
  newSkillGroup,
} from '@/lib/resume/primitives/document';

type ListKey = 'education' | 'projects' | 'certifications' | 'languages' | 'skills' | 'custom';

export type CanvasListEditMode = ListKey | null;

type Props = {
  doc: ResumeDocumentV1;
  setDoc: Dispatch<SetStateAction<ResumeDocumentV1>>;
  bodyPt: number;
  smallPt: number;
  editMode: boolean;
  onDone: () => void;
};

function RemoveRow({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={onRemove}>
      {label}
    </Button>
  );
}

export function CanvasEducationBody({ doc, setDoc, bodyPt, smallPt, editMode, onDone }: Props) {
  if (!editMode) {
    if (doc.education.length === 0) {
      return (
        <div className="space-y-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-dashed"
            onClick={() => {
              setDoc((d) => ({ ...d, education: [...d.education, newEducationItem()] }));
            }}
          >
            Add education
          </Button>
          <p className="text-xs text-muted-foreground">Double-click this section to edit entries.</p>
        </div>
      );
    }
    return (
      <ul className="space-y-2" style={{ fontSize: `${bodyPt}pt` }}>
        {doc.education.map((ed) => (
          <li key={ed.id}>
            <span className="font-semibold">
              {[ed.degree, ed.field].filter(Boolean).join(' — ') || ed.school}
            </span>
            <span className="text-zinc-500"> — {ed.school}</span>
            {ed.details ? (
              <p className="mt-0.5 text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${smallPt}pt` }}>
                {ed.details}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-3">
      {doc.education.map((ed, i) => (
        <div key={ed.id} className="space-y-2 rounded-lg border border-border/60 bg-background/40 p-2">
          <Input
            value={ed.school}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                education: d.education.map((x, j) => (j === i ? { ...x, school: e.target.value } : x)),
              }))
            }
            placeholder="School / institution"
            style={{ fontSize: `${bodyPt}pt` }}
          />
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-[8rem] flex-1"
              value={ed.degree}
              onChange={(e) =>
                setDoc((d) => ({
                  ...d,
                  education: d.education.map((x, j) => (j === i ? { ...x, degree: e.target.value } : x)),
                }))
              }
              placeholder="Degree"
              style={{ fontSize: `${smallPt}pt` }}
            />
            <Input
              className="min-w-[8rem] flex-1"
              value={ed.field}
              onChange={(e) =>
                setDoc((d) => ({
                  ...d,
                  education: d.education.map((x, j) => (j === i ? { ...x, field: e.target.value } : x)),
                }))
              }
              placeholder="Field / major"
              style={{ fontSize: `${smallPt}pt` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-[6rem]"
              value={ed.start}
              onChange={(e) =>
                setDoc((d) => ({
                  ...d,
                  education: d.education.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)),
                }))
              }
              placeholder="Start"
              style={{ fontSize: `${smallPt}pt` }}
            />
            <Input
              className="min-w-[6rem]"
              value={ed.end}
              onChange={(e) =>
                setDoc((d) => ({
                  ...d,
                  education: d.education.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)),
                }))
              }
              placeholder="End"
              style={{ fontSize: `${smallPt}pt` }}
            />
          </div>
          <Textarea
            value={ed.details}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                education: d.education.map((x, j) => (j === i ? { ...x, details: e.target.value } : x)),
              }))
            }
            placeholder="Details, honors…"
            rows={2}
            style={{ fontSize: `${smallPt}pt` }}
          />
          <RemoveRow
            label="Remove entry"
            onRemove={() => setDoc((d) => ({ ...d, education: d.education.filter((_, j) => j !== i) }))}
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => setDoc((d) => ({ ...d, education: [...d.education, newEducationItem()] }))}>
          Add another school
        </Button>
        <Button type="button" size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function CanvasProjectsBody({ doc, setDoc, bodyPt, smallPt, editMode, onDone }: Props) {
  if (!editMode) {
    if (doc.projects.length === 0) {
      return (
        <div className="space-y-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-dashed"
            onClick={() => setDoc((d) => ({ ...d, projects: [...d.projects, newProjectItem()] }))}
          >
            Add project
          </Button>
          <p className="text-xs text-muted-foreground">Double-click this section to edit entries.</p>
        </div>
      );
    }
    return (
      <ul className="space-y-2" style={{ fontSize: `${bodyPt}pt` }}>
        {doc.projects.map((p) => (
          <li key={p.id}>
            <span className="font-semibold">{p.name}</span>
            {p.url ? (
              <span className="block text-blue-600 dark:text-blue-400" style={{ fontSize: `${smallPt}pt` }}>
                {p.url}
              </span>
            ) : null}
            {p.summary ? <p style={{ fontSize: `${smallPt}pt` }}>{p.summary}</p> : null}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-3">
      {doc.projects.map((p, i) => (
        <div key={p.id} className="space-y-2 rounded-lg border border-border/60 bg-background/40 p-2">
          <Input
            value={p.name}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                projects: d.projects.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
              }))
            }
            placeholder="Project name"
            style={{ fontSize: `${bodyPt}pt` }}
          />
          <Input
            value={p.url}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                projects: d.projects.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)),
              }))
            }
            placeholder="URL"
            style={{ fontSize: `${smallPt}pt` }}
          />
          <Textarea
            value={p.summary}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                projects: d.projects.map((x, j) => (j === i ? { ...x, summary: e.target.value } : x)),
              }))
            }
            placeholder="Summary"
            rows={2}
            style={{ fontSize: `${smallPt}pt` }}
          />
          <Textarea
            value={p.highlights.join('\n')}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                projects: d.projects.map((x, j) =>
                  j === i
                    ? {
                        ...x,
                        highlights: e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }
                    : x
                ),
              }))
            }
            placeholder="Highlights (one per line)"
            rows={3}
            style={{ fontSize: `${smallPt}pt` }}
          />
          <RemoveRow
            label="Remove project"
            onRemove={() => setDoc((d) => ({ ...d, projects: d.projects.filter((_, j) => j !== i) }))}
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => setDoc((d) => ({ ...d, projects: [...d.projects, newProjectItem()] }))}>
          Add project
        </Button>
        <Button type="button" size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function CanvasCertificationsBody({ doc, setDoc, bodyPt, smallPt, editMode, onDone }: Props) {
  if (!editMode) {
    if (doc.certifications.length === 0) {
      return (
        <div className="space-y-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-dashed"
            onClick={() => setDoc((d) => ({ ...d, certifications: [...d.certifications, newCertificationItem()] }))}
          >
            Add certification
          </Button>
          <p className="text-xs text-muted-foreground">Double-click this section to edit entries.</p>
        </div>
      );
    }
    return (
      <ul className="space-y-1" style={{ fontSize: `${bodyPt}pt` }}>
        {doc.certifications.map((c) => (
          <li key={c.id}>
            {c.name} <span className="text-zinc-500">— {c.issuer}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-3">
      {doc.certifications.map((c, i) => (
        <div key={c.id} className="space-y-2 rounded-lg border border-border/60 bg-background/40 p-2">
          <Input
            value={c.name}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                certifications: d.certifications.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
              }))
            }
            placeholder="Certification name"
            style={{ fontSize: `${bodyPt}pt` }}
          />
          <div className="flex flex-wrap gap-2">
            <Input
              className="min-w-[8rem] flex-1"
              value={c.issuer}
              onChange={(e) =>
                setDoc((d) => ({
                  ...d,
                  certifications: d.certifications.map((x, j) => (j === i ? { ...x, issuer: e.target.value } : x)),
                }))
              }
              placeholder="Issuer"
              style={{ fontSize: `${smallPt}pt` }}
            />
            <Input
              className="min-w-[6rem]"
              value={c.date}
              onChange={(e) =>
                setDoc((d) => ({
                  ...d,
                  certifications: d.certifications.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)),
                }))
              }
              placeholder="Date"
              style={{ fontSize: `${smallPt}pt` }}
            />
          </div>
          <RemoveRow
            label="Remove"
            onRemove={() => setDoc((d) => ({ ...d, certifications: d.certifications.filter((_, j) => j !== i) }))}
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setDoc((d) => ({ ...d, certifications: [...d.certifications, newCertificationItem()] }))}
        >
          Add certification
        </Button>
        <Button type="button" size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function CanvasLanguagesBody({ doc, setDoc, bodyPt, smallPt, editMode, onDone }: Props) {
  if (!editMode) {
    if (doc.languages.length === 0) {
      return (
        <div className="space-y-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-dashed"
            onClick={() => setDoc((d) => ({ ...d, languages: [...d.languages, newLanguageItem()] }))}
          >
            Add language
          </Button>
          <p className="text-xs text-muted-foreground">Double-click this section to edit entries.</p>
        </div>
      );
    }
    return (
      <p className="text-zinc-700 dark:text-zinc-300" style={{ fontSize: `${bodyPt}pt` }}>
        {doc.languages.map((l) => `${l.name}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(' · ')}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {doc.languages.map((lang, i) => (
        <div key={lang.id} className="flex flex-wrap gap-2 rounded-lg border border-border/60 bg-background/40 p-2">
          <Input
            className="min-w-[6rem] flex-1"
            value={lang.name}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                languages: d.languages.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)),
              }))
            }
            placeholder="Language"
            style={{ fontSize: `${bodyPt}pt` }}
          />
          <Input
            className="min-w-[6rem] flex-1"
            value={lang.proficiency}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                languages: d.languages.map((x, j) => (j === i ? { ...x, proficiency: e.target.value } : x)),
              }))
            }
            placeholder="Level"
            style={{ fontSize: `${smallPt}pt` }}
          />
          <RemoveRow
            label="Remove"
            onRemove={() => setDoc((d) => ({ ...d, languages: d.languages.filter((_, j) => j !== i) }))}
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => setDoc((d) => ({ ...d, languages: [...d.languages, newLanguageItem()] }))}>
          Add language
        </Button>
        <Button type="button" size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function CanvasSkillsBody({ doc, setDoc, bodyPt, smallPt, editMode, onDone }: Props) {
  if (!editMode) {
    if (!doc.skillGroups.some((g) => g.items.length)) {
      return (
        <div className="space-y-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-dashed"
            onClick={() => setDoc((d) => ({ ...d, skillGroups: [...d.skillGroups, { ...newSkillGroup(), items: [''] }] }))}
          >
            Add skill group
          </Button>
          <p className="text-xs text-muted-foreground">Double-click this section to edit entries.</p>
        </div>
      );
    }
    return (
      <div className="space-y-1 text-zinc-700 dark:text-zinc-300" style={{ fontSize: `${bodyPt}pt` }}>
        {doc.skillGroups.map((g) =>
          g.items.length ? (
            <p key={g.id}>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{g.label}: </span>
              {g.items.join(', ')}
            </p>
          ) : null
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {doc.skillGroups.map((g, gi) => (
        <div key={g.id} className="space-y-2 rounded-lg border border-border/60 bg-background/40 p-2">
          <Input
            value={g.label}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                skillGroups: d.skillGroups.map((x, j) => (j === gi ? { ...x, label: e.target.value } : x)),
              }))
            }
            placeholder="Group label (e.g. Frontend)"
            style={{ fontSize: `${bodyPt}pt` }}
          />
          <Input
            value={g.items.join(', ')}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                skillGroups: d.skillGroups.map((x, j) =>
                  j === gi
                    ? {
                        ...x,
                        items: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      }
                    : x
                ),
              }))
            }
            placeholder="Skills, comma-separated"
            style={{ fontSize: `${smallPt}pt` }}
          />
          <RemoveRow
            label="Remove group"
            onRemove={() => setDoc((d) => ({ ...d, skillGroups: d.skillGroups.filter((_, j) => j !== gi) }))}
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => setDoc((d) => ({ ...d, skillGroups: [...d.skillGroups, newSkillGroup()] }))}>
          Add group
        </Button>
        <Button type="button" size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

export function CanvasCustomSectionsBody({ doc, setDoc, secPt, smallPt, accent, secAlign, editMode, onDone }: Props & { secPt: number; accent: string; secAlign: string }) {
  if (!editMode) {
    if (doc.customSections.length === 0) {
      return (
        <div className="space-y-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-dashed"
            onClick={() => setDoc((d) => ({ ...d, customSections: [...d.customSections, newCustomSection()] }))}
          >
            Add custom section
          </Button>
          <p className="text-xs text-muted-foreground">Double-click this section to edit entries.</p>
        </div>
      );
    }
    return (
      <>
        {doc.customSections.map((cs) =>
          cs.title || cs.body ? (
            <div key={cs.id}>
              <h3
                className={cn('mb-1 border-b-2 pb-1 font-bold uppercase tracking-[0.15em]', secAlign)}
                style={{ borderColor: accent, color: accent, fontSize: `${secPt}pt` }}
              >
                {cs.title || 'Section'}
              </h3>
              <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-400" style={{ fontSize: `${smallPt}pt` }}>
                {cs.body}
              </p>
            </div>
          ) : null
        )}
      </>
    );
  }

  return (
    <div className="space-y-3">
      {doc.customSections.map((cs, i) => (
        <div key={cs.id} className="space-y-2 rounded-lg border border-border/60 bg-background/40 p-2">
          <Input
            value={cs.title}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                customSections: d.customSections.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
              }))
            }
            placeholder="Section title"
            style={{ fontSize: `${secPt}pt` }}
          />
          <Textarea
            value={cs.body}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                customSections: d.customSections.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)),
              }))
            }
            placeholder="Body text"
            rows={4}
            style={{ fontSize: `${smallPt}pt` }}
          />
          <RemoveRow
            label="Remove section"
            onRemove={() => setDoc((d) => ({ ...d, customSections: d.customSections.filter((_, j) => j !== i) }))}
          />
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => setDoc((d) => ({ ...d, customSections: [...d.customSections, newCustomSection()] }))}>
          Add section
        </Button>
        <Button type="button" size="sm" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
