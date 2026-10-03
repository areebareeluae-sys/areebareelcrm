"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/tailgrids/core/avatar";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectIndicator,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import { Form } from "react-aria-components";

const countryOptions = [
  { value: "Pakistan", label: "Pakistan" },
  { value: "United States", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "France", label: "France" },
  { value: "Australia", label: "Australia" },
];

export default function AccountFormClient() {
  const [user, setUser] = useState<any>({
    name: "",
    email: "",
    phone: "",
    country: "Pakistan",
    bio: "",
    image: "",
  });
  const [loadingUser, setLoadingUser] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          setErrorMsg(data.error || "Failed to load profile");
        }
      } catch (err) {
        setErrorMsg("Something went wrong while fetching profile.");
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, []);

  if (loadingUser) {
    return <div className="p-6 text-center text-gray-500">Loading profile...</div>;
  }

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // Image file select karne par base64 mein convert karna
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg("Image size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser({ ...user, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name,
          country: user.country,
          bio: user.bio,
          image: user.image,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser({ ...user, image: data.imageUrl || user.image });
        setSuccessMsg("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setErrorMsg(data.error || "Failed to update profile");
      }
    } catch (err) {
      setErrorMsg("An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-transparent p-5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl leading-7 font-semibold text-text-primary">Account Details</h2>
        {!isEditing && (
          <Button type="button" variant="primary" size="sm" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-sm text-center font-medium">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      <Form className="space-y-6" onSubmit={handleUpdate}>
        <div className="flex items-center gap-4">
          <Avatar size="xxl">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name} />
            ) : (
              <AvatarFallback>{firstLetter}</AvatarFallback>
            )}
          </Avatar>

          <div className="flex flex-col gap-2.5">
            {isEditing && (
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center justify-center rounded-md border border-input-border px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
                  Change Avatar
                  <input type="file" accept="image/png, image/jpeg, image/gif" className="hidden" onChange={handleImageChange} />
                </label>
                <Button 
                  appearance="outline" 
                  variant="danger" 
                  size="sm" 
                  type="button" 
                  onClick={() => setUser({ ...user, image: "" })}
                >
                  Remove
                </Button>
              </div>
            )}
            <p className="text-xs leading-4 text-text-tertiary">
              Accepts PNG, JPEG, GIF; max size 2MB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Full Name */}
          <TextField className="w-full gap-2.5">
            <Label>Full Name</Label>
            <Input 
              name="name" 
              value={user.name || ""} 
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              disabled={!isEditing} 
              required 
            />
          </TextField>

          {/* Email (Locked) */}
          <TextField className="w-full gap-2.5">
            <Label>Email address (Cannot be changed)</Label>
            <Input value={user.email || ""} disabled={true} className="bg-gray-100 cursor-not-allowed" />
          </TextField>

          {/* Phone (Locked) */}
          <TextField className="w-full gap-2.5">
            <Label>Phone Number (Cannot be changed)</Label>
            <Input value={user.phone || ""} disabled={true} className="bg-gray-100 cursor-not-allowed" />
          </TextField>

          {/* Country */}
          <div>
            <Label className="block text-sm font-medium mb-1">Country</Label>
            <Select 
              name="country" 
              value={user.country} 
              onChange={(e: any) => setUser({ ...user, country: e.target.value })}
              isDisabled={!isEditing}
            >
              <SelectTrigger className="w-full border-input-border">
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((option) => (
                  <SelectItem key={option.value} id={option.value} textValue={option.label}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bio (Max 500 characters) */}
          <TextField className="col-span-1 w-full gap-2.5 md:col-span-2">
            <div className="flex justify-between items-center">
              <Label>Bio</Label>
              <span className="text-xs text-gray-400">{(user.bio || "").length}/500 characters</span>
            </div>
            <TextArea
              name="bio"
              value={user.bio || ""}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setUser({ ...user, bio: e.target.value });
                }
              }}
              disabled={!isEditing}
              className="h-28 shadow-xs"
              placeholder="Tell us about yourself (max 500 characters)..."
            />
          </TextField>

          {/* Save / Cancel */}
          {isEditing && (
            <div className="col-span-1 flex items-center justify-end gap-3 md:col-span-2">
              <Button
                appearance="outline"
                variant="primary"
                size="lg"
                type="button"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="lg" type="submit" isDisabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </Form>
    </Card>
  );
}