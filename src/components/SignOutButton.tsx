import { signOut } from "@/auth";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/entrar" });
      }}
    >
      <button
        type="submit"
        className={
          className ??
          "inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold text-[var(--muted)]"
        }
      >
        Salir
      </button>
    </form>
  );
}
