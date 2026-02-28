'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PathGenerationRequestSchema, PathGenerationRequest, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';

interface PathGenerationFormProps {
  onGenerate: (data: any) => void;
  isGenerating: boolean;
  initialCategorySlug?: string;
}

export default function PathGenerationForm({
  onGenerate,
  isGenerating,
  initialCategorySlug,
}: PathGenerationFormProps) {
  const router = useRouter();
  const [timeCommitment, setTimeCommitment] = useState(5);
  const [selectedResourceTypes, setSelectedResourceTypes] = useState<string[]>([
    'video',
    'article',
  ]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategorySlug);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PathGenerationRequest>({
    resolver: zodResolver(PathGenerationRequestSchema),
    defaultValues: {
      topic: '',
      categorySlug: initialCategorySlug,
      userBackground: 'beginner',
      learningGoal: 'General learning',
      timeCommitment: '5 hours per week',
      preferredResourceTypes: ['video', 'article'],
      currentKnowledge: [],
    },
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const result = await response.json();

        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const resourceTypes = [
    { id: 'video', label: 'Video Courses' },
    { id: 'article', label: 'Articles & Blogs' },
    { id: 'course', label: 'Interactive Courses' },
    { id: 'book', label: 'Books' },
    { id: 'documentation', label: 'Documentation' },
    { id: 'exercise', label: 'Hands-on Exercises' },
  ];

  const handleResourceTypeChange = (typeId: string, checked: boolean) => {
    const newTypes = checked
      ? [...selectedResourceTypes, typeId]
      : selectedResourceTypes.filter((t) => t !== typeId);

    setSelectedResourceTypes(newTypes);
    setValue('preferredResourceTypes', newTypes);
  };

  const onSubmit = async (data: PathGenerationRequest) => {
    data.timeCommitment = `${timeCommitment} hours per week`;
    data.preferredResourceTypes = selectedResourceTypes;
    data.categorySlug = selectedCategory;

    // Store request in sessionStorage and navigate to generation page
    sessionStorage.setItem('generate-request', JSON.stringify(data));
    router.push('/generate');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Topic Input */}
      <div className="space-y-2">
        <Label htmlFor="topic">What do you want to learn?</Label>
        <Input
          id="topic"
          placeholder="e.g., Guitar, Photography, Python, Mindfulness, French..."
          {...register('topic')}
          disabled={isGenerating}
        />
        {errors.topic && (
          <p className="text-sm text-red-500">{errors.topic.message}</p>
        )}
      </div>

      {/* Category Selection */}
      <div className="space-y-2">
        <Label htmlFor="category">Learning Category (Optional)</Label>
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value === 'none' ? undefined : value);
            setValue('categorySlug', value === 'none' ? undefined : value);
          }}
          disabled={isGenerating}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Any Category</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.slug}>
                <span className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500">
          Selecting a category will optimize the learning path for that domain
        </p>
      </div>

      {/* Background Level */}
      <div className="space-y-2">
        <Label htmlFor="userBackground">Your experience level</Label>
        <Select
          onValueChange={(value) => setValue('userBackground', value)}
          disabled={isGenerating}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
            <SelectItem value="intermediate">
              Intermediate - Have some experience
            </SelectItem>
            <SelectItem value="advanced">
              Advanced - Looking to deepen knowledge
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Learning Goal */}
      <div className="space-y-2">
        <Label htmlFor="learningGoal">What's your goal?</Label>
        <Textarea
          id="learningGoal"
          placeholder="e.g., Get a job, Build a project, Pass an exam"
          {...register('learningGoal')}
          disabled={isGenerating}
          rows={3}
        />
      </div>

      {/* Time Commitment */}
      <div className="space-y-3">
        <Label>Time commitment: {timeCommitment} hours per week</Label>
        <Slider
          value={[timeCommitment]}
          onValueChange={(value) => setTimeCommitment(value[0])}
          min={1}
          max={20}
          step={1}
          disabled={isGenerating}
          className="w-full"
        />
      </div>

      {/* Preferred Resource Types */}
      <div className="space-y-3">
        <Label>Preferred learning resources</Label>
        <div className="grid grid-cols-2 gap-3">
          {resourceTypes.map((type) => (
            <div key={type.id} className="flex items-center space-x-2">
              <Checkbox
                id={type.id}
                checked={selectedResourceTypes.includes(type.id)}
                onCheckedChange={(checked) =>
                  handleResourceTypeChange(type.id, checked as boolean)
                }
                disabled={isGenerating}
              />
              <Label
                htmlFor={type.id}
                className="text-sm font-normal cursor-pointer"
              >
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Current Knowledge (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="currentKnowledge">
          What related topics do you already know? (Optional)
        </Label>
        <Textarea
          id="currentKnowledge"
          placeholder="e.g., Python, Basic Statistics, HTML/CSS"
          {...register('currentKnowledge')}
          disabled={isGenerating}
          rows={2}
          onChange={(e) => {
            const value = e.target.value;
            const knowledge = value
              .split(',')
              .map((item) => item.trim())
              .filter((item) => item.length > 0);
            setValue('currentKnowledge', knowledge);
          }}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full relative z-10"
        disabled={isGenerating}
        size="lg"
      >
        {isGenerating ? 'Generating your learning path...' : 'Generate Learning Path'}
      </Button>
    </form>
  );
}
