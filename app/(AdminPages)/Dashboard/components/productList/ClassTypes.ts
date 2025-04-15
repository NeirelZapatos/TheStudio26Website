export type Class = {
  _id: string;
  name: string;
  description: string;
  class_category: string;
  price: number;
  date?: string;
  time?: string;
  instructor?: string;
  duration?: number;
  location?: string;
  images?: string[];
  image_url?: string;
  prerequisite?: boolean;
  prerequisiteClass?: string;
  max_capacity?: number;
}