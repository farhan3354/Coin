"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const initialQuestion = () => ({
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});

export default function AdminQuizzes() {
  const { quizzes, addQuiz, deleteQuiz } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    rewardPoints: 50,
    questions: [initialQuestion()],
  });

  const updateQuestion = (
    index: number,
    patch: Partial<{ text: string; correctIndex: number; options: string[] }>,
  ) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, ...patch } : q,
      ),
    }));
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, initialQuestion()],
    }));
  };

  const removeQuestion = (index: number) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanQuestions = form.questions
      .map((question) => {
        const trimmedOptions = question.options.map((option) => option.trim());
        const validOptions = trimmedOptions.filter(Boolean);
        if (!question.text.trim() || validOptions.length < 2) return null;

        const correctIndex = Number(question.correctIndex);
        if (
          Number.isNaN(correctIndex) ||
          correctIndex < 0 ||
          correctIndex >= validOptions.length
        ) {
          return null;
        }

        const finalOptions = Array.from({ length: 4 }, (_, i) => {
          const fromOriginal = trimmedOptions[i] ?? "";
          return fromOriginal || "";
        });

        return {
          text: question.text.trim(),
          options: finalOptions.filter((opt) => opt !== ""),
          correctIndex: Math.min(
            correctIndex,
            finalOptions.filter((opt) => opt !== "").length - 1,
          ),
        };
      })
      .filter(Boolean) as any[];

    if (!form.title.trim()) {
      toast.error("Quiz title is required");
      return;
    }

    if (cleanQuestions.length === 0) {
      toast.error("Add at least one valid multiple-choice question");
      return;
    }

    addQuiz({
      title: form.title.trim(),
      description: form.description.trim(),
      rewardPoints: Number(form.rewardPoints) || 0,
      questions: cleanQuestions,
    });
    toast.success("Quiz added");
    setOpen(false);
    setForm({
      title: "",
      description: "",
      rewardPoints: 50,
      questions: [initialQuestion()],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>Add Quiz</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {quizzes.map((q: any) => (
          <Card key={q.id}>
            <CardContent className="p-4">
              <h3 className="font-semibold">{q.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {q.description}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    deleteQuiz(q.id);
                    toast.success("Deleted");
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add MCQ Quiz</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Reward Points</Label>
              <Input
                type="number"
                min={0}
                value={form.rewardPoints}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rewardPoints: Number(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Questions</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuestion}
                >
                  Add Question
                </Button>
              </div>

              {form.questions.map((question, index) => (
                <div key={index} className="space-y-3 rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">Question {index + 1}</p>
                    {form.questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Question text</Label>
                    <Input
                      required
                      value={question.text}
                      onChange={(e) =>
                        updateQuestion(index, { text: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="grid grid-cols-[1fr_auto] gap-2 items-center"
                      >
                        <Input
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => {
                            const nextOptions = [...question.options];
                            nextOptions[optionIndex] = e.target.value;
                            updateQuestion(index, { options: nextOptions });
                          }}
                        />
                        <Button
                          type="button"
                          variant={
                            question.correctIndex === optionIndex
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() =>
                            updateQuestion(index, { correctIndex: optionIndex })
                          }
                        >
                          {question.correctIndex === optionIndex
                            ? "Correct"
                            : "Set Answer"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="submit">Create Quiz</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
