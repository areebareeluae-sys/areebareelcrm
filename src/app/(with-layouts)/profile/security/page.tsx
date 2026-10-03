"use client";

import { Button, buttonStyles } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { Label } from "@/components/tailgrids/core/label";
import { Backdrop, OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { TextField } from "@/components/tailgrids/core/text-field";
import { cn } from "@/utils/cn";
import { Eye, EyeDisabled } from "@tailgrids/icons";
import { useState } from "react";
import { FieldError, Form } from "react-aria-components";
import { securityItems } from "./data";

export default function SecurityTabContent() {
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form fields states & error/success messages
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirm password do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update password.");
      } else {
        setSuccessMsg("Password updated successfully!");
        setTimeout(() => {
          setOpenPasswordDialog(false);
          // Reset fields
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setSuccessMsg("");
        }, 1500);
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl leading-7 font-semibold text-text-primary">Security</h2>

      <div className="mt-6 space-y-2 divide-y divide-card-border">
        {securityItems.map(({ icon: Icon, title, description, actionLabel }) => (
          <div
            key={title}
            className="flex flex-col gap-4 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background-gray-secondary_alt text-icon-secondary">
                <Icon />
              </div>

              <div className="min-w-0">
                <p className="text-sm leading-5 font-medium text-text-primary">{title}</p>
                <p className="mt-1 text-xs leading-4 text-text-tertiary">{description}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto shrink-0 rounded-none py-2 pr-0 text-base text-brand-500 hover:bg-transparent hover:text-brand-600 focus:ring-0"
              onClick={() => {
                if (actionLabel.toLowerCase() === "change") {
                  setErrorMsg("");
                  setSuccessMsg("");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setOpenPasswordDialog(true);
                }
              }}
            >
              {actionLabel}
            </Button>
          </div>
        ))}
      </div>

      <OverlayWrapper isOpen={openPasswordDialog} onOpenChange={setOpenPasswordDialog}>
        <Backdrop isDismissable>
          <Dialog className="max-w-108.75 p-0">
            <Form onSubmit={handlePasswordUpdate}>
              <DialogHeader className="gap-1 border-b border-card-border py-4 pr-14 pl-5">
                <DialogTitle className="text-xl leading-7">Update Password</DialogTitle>
                <DialogDescription className="text-text-tertiary">
                  Create a secure password to keep your account safe
                </DialogDescription>
              </DialogHeader>

              <DialogBody className="space-y-4 px-5 py-4">
                {/* Error & Success Messages */}
                {errorMsg && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 border border-green-200">
                    {successMsg}
                  </div>
                )}

                <TextField className="gap-1.5">
                  <Label htmlFor="current-password">Current Password</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      autoComplete="current-password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <InputGroupButton
                      size="icon-sm"
                      className="mr-1"
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? (
                        <EyeDisabled className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </InputGroupButton>
                  </InputGroup>
                </TextField>

                <TextField className="gap-1.5">
                  <Label htmlFor="new-password">New Password</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Choose a new password"
                      minLength={8}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <InputGroupButton
                      size="icon-sm"
                      className="mr-1"
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? (
                        <EyeDisabled className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </InputGroupButton>
                  </InputGroup>
                  <FieldError />
                </TextField>

                <TextField className="gap-1.5">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your new password"
                      minLength={8}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <InputGroupButton
                      size="icon-sm"
                      className="mr-1"
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeDisabled className="size-5" />
                      ) : (
                        <Eye className="size-5" />
                      )}
                    </InputGroupButton>
                  </InputGroup>
                  <FieldError />
                </TextField>
              </DialogBody>

              <DialogFooter className="border-t border-card-border px-5 py-4">
                <DialogClose
                  className={cn(
                    buttonStyles({
                      appearance: "outline",
                      size: "lg",
                      className: "px-3.5 text-sm",
                    }),
                  )}
                >
                  Cancel
                </DialogClose>
                <Button type="submit" size="lg" className="px-3.5 text-sm" isDisabled={isLoading}>
                  {isLoading ? "Updating..." : "Apply Changes"}
                </Button>
              </DialogFooter>
            </Form>
          </Dialog>
        </Backdrop>
      </OverlayWrapper>
    </div>
  );
}