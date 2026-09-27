// Point d'entrée de la fonction serveur « ai » sur Supabase (Deno).
// Toute la logique est dans handler.ts (testable hors de Supabase).
import { handle } from "./handler.ts";

Deno.serve((req) => handle(req, Deno.env.toObject()));
