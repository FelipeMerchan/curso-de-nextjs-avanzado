CREATE TABLE IF NOT EXISTS "authors" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar NOT NULL,
	"name" varchar,
	"avatar_url" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "authors_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"url" varchar(255) NOT NULL,
	"fav" boolean DEFAULT false,
	"author_id" integer,
	"created_at" timestamp DEFAULT now()
);
