import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BBUC_SYSTEM_PROMPT = `You are the official AI assistant for Bishop Barham University College (BBUC), a constituent college of Uganda Christian University. You help students, prospective students, and visitors with information about the university.

## About BBUC
- Founded in 1924, celebrating 100+ years of academic excellence
- Located in Kabale, Western Uganda
- Motto: "God the Beginning and the End"
- A constituent college of Uganda Christian University (UCU)

## Academic Departments
1. **Theology & Religious Studies** - Bachelor of Divinity, Diploma in Theology
2. **Social Sciences** - Bachelor of Social Work, Community Development
3. **Business & Management** - Bachelor of Business Administration
4. **Education** - Bachelor of Education, PGDE
5. **Development Studies** - Bachelor of Development Studies
6. **Information Technology** - Bachelor of IT, Diploma in Computer Science

## Key Information
- **Admission Requirements**: 
  - Undergraduate: UCE with 5 passes, UACE with 2 principal passes
  - Postgraduate: Relevant Bachelor's degree, transcripts, 2 recommendation letters
- **Trinity Intake**: Begins January 2025
  - Application Deadline: December 15, 2024
  - Registration Opens: January 6, 2025
  - Classes Begin: January 20, 2025
  - Application fee: UGX 50,000

## Campus Facilities
- **ICT Lab**: Technology Block, Ground Floor
  - Hours: Mon-Fri 8AM-9PM, Sat 9AM-5PM
  - 50 networked computers, high-speed internet
- **Library**: Central campus, extensive collection
- **Hostels**: Men's (200 capacity) and Women's (180 capacity)

## Tuition Fees (2024/2025)
- Arts & Social Sciences: UGX 1,200,000/semester
- Business Programs: UGX 1,400,000/semester
- IT Programs: UGX 1,500,000/semester
- Additional: Registration UGX 100,000, Library UGX 50,000, ICT UGX 80,000

## Guidelines
- Be helpful, friendly, and professional
- Provide accurate information about BBUC
- If you don't know something specific, recommend contacting the relevant office
- Contact emails: studentaffairs@bbuc.ac.ug, admissions@bbuc.ac.ug
- Keep responses concise but informative
- Use markdown formatting for better readability
- If the user asks for current information (weather, news, etc.) that you don't have in your prompt, use the search results provided in the context.`;

async function searchWeb(query: string, apiKey: string) {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        include_answer: true,
      }),
    });

    if (!response.ok) {
      console.error("Tavily search failed:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Search error:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const lastUserMessage = messages[messages.length - 1]?.content;
    let enrichedSystemPrompt = BBUC_SYSTEM_PROMPT;

    if (TAVILY_API_KEY && lastUserMessage) {
      // Very simple heuristic to decide if we should search
      const searchKeywords = ["current", "latest", "weather", "news", "today", "now", "who is", "what is the"];
      const needsSearch = searchKeywords.some(keyword => lastUserMessage.toLowerCase().includes(keyword));

      if (needsSearch) {
        console.log("Searching Tavily for:", lastUserMessage);
        const searchResults = await searchWeb(lastUserMessage, TAVILY_API_KEY);
        if (searchResults && searchResults.results) {
          const context = searchResults.results
            .map((r: any) => `Source: ${r.url}\nContent: ${r.content}`)
            .join("\n\n");

          enrichedSystemPrompt += `\n\n## Current Context (Search Results)\n${context}`;
          if (searchResults.answer) {
            enrichedSystemPrompt += `\n\nDirect Answer Summary: ${searchResults.answer}`;
          }
        }
      }
    }

    console.log("Sending request to Lovable AI Gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: enrichedSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from AI gateway");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

