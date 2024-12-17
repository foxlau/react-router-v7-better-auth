import { redirect } from "react-router";
import { signOut } from "~/auth/auth.client";

export async function loader() {
  return redirect("/auth/sign-in");
}

export async function clientAction() {
  await signOut();
  return redirect("/auth/sign-in");
}
