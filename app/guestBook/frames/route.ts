import { init, fetchQuery } from "@airstack/node";
import { followingQuery, userQuery } from "../../queries";
import { NextResponse } from "next/server";
import { generate } from "text-to-image";

init(process.env.AIRSTACK_KEY || "");

const allMessages: string[] = [];
const baseUrl = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";

const bookUrl = "https://i.postimg.cc/pr8VFQ1d/Renaissance-Painting.png";
const nickUrl =
  "https://i.postimg.cc/gkk2gh5n/Screenshot-2024-02-19-at-19-11-08.png";

const _html = (img: any, inputText?: string) => `
<!DOCTYPE html>
<html>
  <head>
    <title>Frame</title>
    <meta property="og:image" content="${img}" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${img}" />
    <meta property="fc:frame:image:aspect_ratio" content="1:1" />
    <meta property="fc:frame:post_url" content="${baseUrl}/guestBook/frames" />

    <meta property="fc:frame:button:1" content="Submit" />
    <meta property="fc:frame:button:2" content="View Guest Book" />

    <meta property="fc:frame:input:text" content="${
      inputText ?? "leave a message"
    }" />
  </head>
</html>
`;

const _guestBook = async (inputText?: string) => {
  const image = await generate(
    `@Niick's 10 most recent guests:\n\n${allMessages.join("")}`,
    {
      maxWidth: 720,
      fontSize: 24,
      fontFamily: "Arial",
      lineHeight: 30,
      margin: 5,
      bgColor: "white",
      textColor: "black",
    }
  );

  return `
<!DOCTYPE html>
<html>
<head>
<meta property="fc:frame:button:1" content="Submit" />
<meta property="fc:frame:button:2" content="View Guest Book" />
<meta property="fc:frame:post_url" content="${baseUrl}/guestBook/frames" />

<meta property="og:image" content="${image}" />
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="${image}" />
<meta property="fc:frame:image:aspect_ratio" content="1:1" />


<meta property="fc:frame:input:text" content="${
    inputText ?? "leave a message"
  }" />
</head>
</html>
`;
};

export async function POST(req: any) {
  const data = await req.json();

  const { untrustedData } = data;
  const { inputText, fid, buttonIndex } = untrustedData;

  const didClickSubmitButton = buttonIndex === 1;
  const didClickViewGuestBookButton = !didClickSubmitButton;

  const uquery = userQuery(fid);
  const { data: profileDisplayName } = await fetchQuery(uquery, {
    id: fid,
  });

  const username =
    profileDisplayName?.Wallet?.socials?.[0]?.profileDisplayName ?? "";

  const didEnterInput = inputText && inputText.length > 0;

  // Case: user entered input: add to guestbook
  if (didEnterInput) {
    if (!username) {
      allMessages.push(`${inputText}\n`);
    } else {
      allMessages.push(`${username + ": " + inputText}\n`);
    }

    // ensure allMessages is only 10 messages long
    if (allMessages.length > 10) {
      allMessages.shift();
    }
  }

  // Case: submit without input text, reutrn first page
  if (didClickSubmitButton) {
    if (didEnterInput) {
      return new NextResponse(_html(nickUrl, "¿leave another message?"));
    }
    return new NextResponse(
      _html(bookUrl, `${username + " "}please write a message`)
    );
  } else {
    return new NextResponse(await _guestBook("Thanks for stopping by!"));
  }
}

export const dynamic = "force-dynamic";
