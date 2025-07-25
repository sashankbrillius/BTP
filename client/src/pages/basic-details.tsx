import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Upload, FileText } from "lucide-react";

const basicDetailsSchema = z.object({
  currentRole: z.string().min(1, "Please enter your current role"),
  yearsExperience: z.string().min(1, "Please select your years of experience"),
  interest: z.enum(["AIOps", "MLOps"], {
    required_error: "Please select your area of interest",
  }),
  resume: z.instanceof(File, { message: "Please upload your resume" })
    .refine((file) => file.size <= 5000000, "File size must be less than 5MB")
    .refine(
      (file) => ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type),
      "Only PDF and DOCX files are allowed"
    ),
});

type BasicDetailsForm = z.infer<typeof basicDetailsSchema>;

export default function BasicDetailsPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<BasicDetailsForm>({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: {
      currentRole: "",
      yearsExperience: "",
      interest: undefined,
    },
  });

  const updateDetailsMutation = useMutation({
    mutationFn: async (data: BasicDetailsForm) => {
      const formData = new FormData();
      formData.append('currentRole', data.currentRole);
      formData.append('yearsExperience', data.yearsExperience);
      formData.append('interest', data.interest);
      formData.append('resume', data.resume);
      
      const response = await fetch('/api/user/update-details', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update profile');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your details have been saved successfully.",
      });
      setLocation('/assessment');
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BasicDetailsForm) => {
    updateDetailsMutation.mutate(data);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue('resume', file);
      form.clearErrors('resume');
    }
  };

  const experienceOptions = [
    { value: "0-1", label: "Less than 1 year" },
    { value: "1-2", label: "1-2 years" },
    { value: "2-5", label: "2-5 years" },
    { value: "5-10", label: "5-10 years" },
    { value: "10+", label: "10+ years" },
  ];

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/brillius-logo.png" 
                alt="Brillius Technologies Logo" 
                className="h-12 w-auto"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0ZGNkIzNSIvPgo8dGV4dCB4PSIyMCIgeT0iMjciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5CPC90ZXh0Pgo8L3N2Zz4K';
                }}
              />
            </Link>
          </div>
          <CardTitle className="text-heading text-3xl">Complete Your Profile</CardTitle>
          <CardDescription className="text-body">
            Tell us about your background to personalize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="currentRole" className="text-brand-dark font-medium">Current Role</Label>
              <Input
                id="currentRole"
                type="text"
                {...form.register("currentRole")}
                placeholder="e.g., Software Engineer, DevOps Engineer, Data Scientist"
                className="mt-1"
              />
              {form.formState.errors.currentRole && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.currentRole.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="yearsExperience" className="text-brand-dark font-medium">Years of Experience</Label>
              <Select 
                value={form.watch("yearsExperience")} 
                onValueChange={(value) => form.setValue("yearsExperience", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.yearsExperience && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.yearsExperience.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="interest" className="text-brand-dark font-medium">Area of Interest</Label>
              <Select 
                value={form.watch("interest")} 
                onValueChange={(value: "AIOps" | "MLOps") => form.setValue("interest", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose your learning focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIOps">AIOps (AI for IT Operations)</SelectItem>
                  <SelectItem value="MLOps">MLOps (Machine Learning Operations)</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.interest && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.interest.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="resume" className="text-brand-dark font-medium">Upload Resume</Label>
              <div className="mt-1">
                <label 
                  htmlFor="resume-upload" 
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-orange transition-colors"
                >
                  <div className="text-center">
                    {selectedFile ? (
                      <>
                        <FileText className="h-8 w-8 text-brand-orange mx-auto mb-2" />
                        <p className="text-sm font-medium text-brand-dark">{selectedFile.name}</p>
                        <p className="text-xs text-brand-gray">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-brand-gray">Upload your resume</p>
                        <p className="text-xs text-brand-gray">PDF or DOCX, max 5MB</p>
                      </>
                    )}
                  </div>
                </label>
                <input
                  id="resume-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                />
              </div>
              {form.formState.errors.resume && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.resume.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="btn-primary w-full text-lg py-6"
              disabled={updateDetailsMutation.isPending}
            >
              {updateDetailsMutation.isPending ? "Saving..." : "Take me to Assessment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}