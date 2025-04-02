"use client";

import { toast } from "sonner";
import { useState } from "react";
import CTA from "@/components/cta";
import Form from "@/components/form";
// import Logos from "@/components/logos";
import Particles from "@/components/ui/particles";
// import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Home() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleInstagramChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInstagram(event.target.value);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!name || !email || !instagram) {
      toast.error("Please fill in all fields 😠");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address 😠");
      return;
    }

    setLoading(true);

    const promise = new Promise(async (resolve, reject) => {
      try {
        // First, check if this email already exists in Notion
        const notionResponse = await fetch("/api/notion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, instagram }),
        });

        if (!notionResponse.ok) {
          if (notionResponse.status === 429) {
            reject("Rate limited");
          } else if (notionResponse.status === 409) {
            // Handle case where email already exists
            const errorData = await notionResponse.json();
            reject("Email already exists");
          } else {
            reject("Notion insertion failed");
          }
          return;
        }
        
        // If Notion insertion is successful, proceed to send welcome email
        const mailResponse = await fetch("/api/mail", {
          cache: "no-store",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firstname: name, email }),
        });

        if (!mailResponse.ok) {
          if (mailResponse.status === 429) {
            reject("Rate limited");
          } else {
            reject("Email sending failed");
          }
          return;
        }
        
        // Everything succeeded
        resolve({ name });
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: "Getting you on the waitlist... 🚀",
      success: (data) => {
        setName("");
        setEmail("");
        setInstagram("");
        return "Thank you for joining the waitlist 🎉";
      },
      error: (error) => {
        if (error === "Rate limited") {
          return "You're doing that too much. Please try again later";
        } else if (error === "Email sending failed") {
          return "Failed to send email. Please try again 😢.";
        } else if (error === "Email already exists") {
          return "This email is already on our waitlist! 📝";
        } else if (error === "Notion insertion failed") {
          return "Failed to save your details. Please try again 😢.";
        }
        return "An error occurred. Please try again 😢.";
      },
    });

    promise.finally(() => {
      setLoading(false);
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-x-clip">
      <section className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* <Header /> */}

        <CTA />

        <Form
          name={name}
          email={email}
          instagram={instagram}
          handleNameChange={handleNameChange}
          handleEmailChange={handleEmailChange}
          handleInstagramChange={handleInstagramChange}
          handleSubmit={handleSubmit}
          loading={loading}
        />

        {/* <Logos /> */}
      </section>

      {/* <Footer /> */}

      <Particles
        quantityDesktop={350}
        quantityMobile={100}
        ease={80}
        color={"#eb0700"}
        refresh
      />
    </main>
  );
}
