"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { GlassContainer } from "@/components/ui/glass-container"

export default function AddGamePage() {
  const [rating, setRating] = useState([3])
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Form submission logic would be implemented here
    console.log("Form submitted")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-emerald-500/30 blur-sm"
            style={{
              width: `${Math.random() * 6 + 1}px`,
              height: `${Math.random() * 6 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
            }}
          />
        ))}

        {/* Large glass orbs */}
        <div className="absolute top-[10%] right-[5%] w-64 h-64 rounded-full bg-emerald-500/5 blur-2xl" />
        <div className="absolute bottom-[20%] left-[10%] w-80 h-80 rounded-full bg-purple-500/5 blur-2xl" />
      </div>

      <div className="container px-4 py-8 mx-auto relative z-10">
        <Link
          href="/"
          className="inline-flex items-center text-slate-300 hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Link>

        <div className="max-w-3xl mx-auto">
          <GlassContainer className="p-6" intensity="medium">
            <h1 className="text-2xl font-bold text-white mb-6">Add New Game</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-white font-medium">
                      Game Title
                    </Label>
                    <GlassContainer className="p-0" intensity="medium">
                      <Input
                        id="title"
                        placeholder="Enter game title"
                        className="bg-transparent border-0 text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </GlassContainer>
                  </div>

                  <div>
                    <Label htmlFor="platform" className="text-white font-medium">
                      Platform
                    </Label>
                    <GlassContainer className="p-0" intensity="medium">
                      <Select>
                        <SelectTrigger className="bg-transparent border-0 text-white focus:ring-0">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800/95 backdrop-blur-md border-white/20">
                          <SelectItem value="pc" className="text-white hover:bg-white/15">
                            PC
                          </SelectItem>
                          <SelectItem value="ps5" className="text-white hover:bg-white/15">
                            PlayStation 5
                          </SelectItem>
                          <SelectItem value="ps4" className="text-white hover:bg-white/15">
                            PlayStation 4
                          </SelectItem>
                          <SelectItem value="xsx" className="text-white hover:bg-white/15">
                            Xbox Series X/S
                          </SelectItem>
                          <SelectItem value="xbone" className="text-white hover:bg-white/15">
                            Xbox One
                          </SelectItem>
                          <SelectItem value="switch" className="text-white hover:bg-white/15">
                            Nintendo Switch
                          </SelectItem>
                          <SelectItem value="other" className="text-white hover:bg-white/15">
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </GlassContainer>
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-white font-medium">
                      Status
                    </Label>
                    <GlassContainer className="p-0" intensity="medium">
                      <Select>
                        <SelectTrigger className="bg-transparent border-0 text-white focus:ring-0">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800/95 backdrop-blur-md border-white/20">
                          <SelectItem value="completed" className="text-white hover:bg-white/15">
                            Completed
                          </SelectItem>
                          <SelectItem value="in-progress" className="text-white hover:bg-white/15">
                            In Progress
                          </SelectItem>
                          <SelectItem value="on-hold" className="text-white hover:bg-white/15">
                            On Hold
                          </SelectItem>
                          <SelectItem value="not-started" className="text-white hover:bg-white/15">
                            Not Started
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </GlassContainer>
                  </div>

                  <div>
                    <Label htmlFor="rating" className="text-white font-medium">
                      Rating
                    </Label>
                    <div className="pt-2">
                      <GlassContainer className="p-4" intensity="medium" textContrast="high">
                        <Slider
                          defaultValue={[3]}
                          max={5}
                          step={1}
                          value={rating}
                          onValueChange={setRating}
                          className="[&>span:first-child]:h-2 [&>span:first-child]:bg-slate-700 [&>span:nth-child(2)>span]:bg-emerald-500"
                        />
                        <div className="text-center text-white mt-2 font-medium">{rating[0]} / 5</div>
                      </GlassContainer>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image" className="text-white font-medium">
                      Game Cover Image
                    </Label>
                    <GlassContainer className="mt-1" intensity="medium">
                      <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-white/20 rounded-md">
                        {imagePreview ? (
                          <div className="relative w-full aspect-[3/4]">
                            <img
                              src={imagePreview || "/placeholder.svg"}
                              alt="Preview"
                              className="object-cover w-full h-full rounded-md"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 border border-white/20"
                              onClick={() => setImagePreview(null)}
                            >
                              Change
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-slate-300" />
                            <div className="flex text-sm text-slate-300">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md font-medium text-emerald-400 hover:text-emerald-300"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  onChange={handleImageChange}
                                  accept="image/*"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-slate-300">PNG, JPG, GIF up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </GlassContainer>
                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-white">
                      Personal Notes
                    </Label>
                    <GlassContainer className="p-0" intensity="low">
                      <Textarea
                        id="notes"
                        placeholder="Add your personal notes, tips, or thoughts about the game..."
                        className="bg-transparent border-0 text-white h-32 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </GlassContainer>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="solutions" className="text-white">
                  Solutions & Guides
                </Label>
                <GlassContainer className="p-0" intensity="low">
                  <Textarea
                    id="solutions"
                    placeholder="Add solutions to puzzles, boss strategies, or other helpful information..."
                    className="bg-transparent border-0 text-white h-32 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </GlassContainer>
              </div>

              <div className="flex justify-end space-x-4">
                <Link href="/">
                  <Button
                    variant="outline"
                    className="bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-700/30 transition-all duration-300"
                >
                  Save Game
                </Button>
              </div>
            </form>
          </GlassContainer>
        </div>
      </div>
    </div>
  )
}
