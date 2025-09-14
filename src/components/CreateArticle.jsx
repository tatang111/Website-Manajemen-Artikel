import { ArrowLeft, ImagePlus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "next/image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "./ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "@/lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import PreviewArticle from "./PreviewArticle";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

const schema = z.object({
  title: z
    .string()
    .nonempty("Please enter title")
    .min(5, "Minimal 5 character"),
  image: z.any().refine(file => file instanceof File, { message: "Thumbnail is required" }),
  description: z
    .string()
    .nonempty("Please enter description")
    .min(20, "Description at least 20 characters"),
  category: z.string().nonempty("Pilih Select Category"),
});

export const CreateArticle = ({ setIsCreate }) => {
  const [preview, setPreview] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [seePreview, setSeePreview] = useState(false);
  const queryClient = useQueryClient()
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: "Type a content...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const rawText = editor.getText({ blockSeparator: " " });
      const trimmedText = rawText.trim().replace(/\s+/g, " ");
      const words = trimmedText === "" ? [] : trimmedText.split(" ");
      setWordCount(words[0]?.length || 0);
      setValue("description", trimmedText, { shouldValidate: true });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const { data: articleCategory } = useQuery({
    queryKey: ["getCategory"],
    queryFn: async () => {
      const response = await axiosInstance("/articles", {
        params: {
          limit: 30,
        },
      });
      return response.data;
    },
  });
  const dataCategories = articleCategory?.data.map((article) => ({
    id: article.categoryId,
    name: article.category.name,
  }));
  const uniqCategories = _.uniqBy(dataCategories, "id");

  const { data: realCategory } = useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/categories");
      return data;
    },
  });

  useEffect(() => {
    setCategories(uniqCategories);
  }, [articleCategory]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setValue("image", file, { shouldValidate: true });
  };

  const handleUploadImage = async (file) => {
    try {
      const fileName = `${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      toast.error("Image upload failed");
      console.log(error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const imageUrl = await handleUploadImage(data.image);

      let idCategory = realCategory.data.find(
        (c) => c.name === data.category
      ).id;

      const response = await axiosInstance.post("/articles", {
        title: data.title,
        content: data.description,
        categoryId: idCategory,
        imageUrl: imageUrl,
      });

      queryClient.invalidateQueries({ queryKey: ["getCategory"] })
      toast.success("Create Article Success");
      setIsCreate(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  if (seePreview)
    return (
      <PreviewArticle
        setSeePreview={setSeePreview}
        title={watch("title")}
        image={watch("image")}
        category={watch("category")}
        description={watch("description")}
      />
    );
  return (
    <main className="pt-6 px-6 bg-gray-100 min-h-screen pb-10">
      <div className="bg-gray-50 gap-2 items-center p-6 rounded-t-lg flex">
        <button onClick={() => setIsCreate(false)} className="cursor-pointer">
          <ArrowLeft />
        </button>
        <h2 className="text-base font-[500] mb-[1px]"> Create Article</h2>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="px-6 py-3 grid gap-5 rounded-b-lg bg-gray-50"
      >
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600 mb-2" />
              <p className="text-gray-700">Uploading your article...</p>
            </div>
          </div>
        )}
        <div className="grid h-47 create-movie-image-upload w-20">
          <h4 className="text-base font-[500]">Thumbnails</h4>
          <div className="flex flex-col mb-4 ">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting}
              />
              <div className="w-32 h-32 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center">
                {preview ? (
                  <Image
                    width={100}
                    height={100}
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="">
                    <ImagePlus className="m-auto block text-gray-500" />
                    <span className="text-gray-500 underline text-xs">
                      Click to select files
                    </span>
                  </div>
                )}
              </div>
            </label>
          </div>
          {errors.image && (
            <span className="text-red-500 text-sm w-3/1">
              {errors.image.message}
            </span>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            disabled={isSubmitting}
            name="title"
            {...register("title")}
            placeholder="Input title"
          />
          {errors.title && (
            <span className="text-red-500 text-sm">{errors.title.message}</span>
          )}
        </div>
        <div className="grid gap-3">
          <Label>Category</Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                disabled={isSubmitting}
                id="category"
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger className="w-full bg-white text-black">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-black">
                      Select Category
                    </SelectLabel>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && (
            <span className="text-red-500 text-sm">
              {errors.category.message}
            </span>
          )}
          <p className="text-sm text-gray-500">
            The existing category list can be seen in the{" "}
            <span className="text-blue-600 underline cursor-pointer">
              category
            </span>{" "}
            menu
          </p>
        </div>
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="flex gap-2 px-3 py-2 border-b items-center">
            <button
              type="button"
              onClick={() => editor?.chain().focus().undo().run()}
            >
              &#8630;
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().redo().run()}
            >
              &#8631;
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className="font-bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className="italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setParagraph().run()}
            >
              P
            </button>
            <button
              type="button"
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .setImage({ src: prompt("Image URL") || "" })
                  .run()
              }
            >
              🖼️
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            >
              ☰
            </button>
            <button
              type="button"
              onClick={() =>
                editor?.chain().focus().setTextAlign("center").run()
              }
            >
              ≡
            </button>
            <button
              type="button"
              onClick={() =>
                editor?.chain().focus().setTextAlign("right").run()
              }
            >
              ☰
            </button>
          </div>

          <EditorContent
            editor={editor}
            className="min-h-[200px] px-4 py-3 outline-none bg-gray-50"
            placeholder="Type a content..."
            disabled={isSubmitting}
          />
          <input
            type="hidden"
            disabled={isSubmitting}
            {...register("description")}
          />
          <div className="px-4 py-2 text-sm text-gray-500 border-t">
            {wordCount} Words
          </div>
        </div>
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
        <div className="flex mt-4 justify-end gap-3 text-black mb-3">
          <Button
            disabled={isSubmitting}
            type="button"
            onClick={() => setIsCreate(false)}
            className="bg-white hover:bg-white shadow cursor-pointer text-black"
          >
            Cancel
          </Button>
          <Button
            disabled={isSubmitting}
            type="button"
            onClick={() => setSeePreview(true)}
            className="bg-slate-200 hover:bg-slate-300 shadow cursor-pointer text-black"
          >
            Preview
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 shadow cursor-pointer text-white"
          >
            {isSubmitting ? <Loader2 /> : "Upload"}
          </Button>
        </div>
      </form>
    </main>
  );
};
