import {
  FrameButton,
  FrameContainer,
  FrameImage,
  FrameInput,
  FrameReducer,
  NextServerPageProps,
  getFrameMessage,
  getPreviousFrame,
  useFramesReducer,
} from "frames.js/next/server";
import Link from "next/link";
import { DEBUG_HUB_OPTIONS } from "../debug/constants";

export enum PageType {
  LeaveMessage = 1,
  BlankText = 2,
  ViewBookNoMessage = 3,
  LeftMessage = 4,
  ViewBookWithMessage = 5,
}

type State = {
  pageIndex: PageType;
  leftMessage: boolean;
};

const photoUrls = [
  "https://picsum.photos/seed/frames.js-0/1146/600",
  "https://picsum.photos/seed/frames.js-1/1146/600",
  "https://picsum.photos/seed/frames.js-2/1146/600",
  "https://picsum.photos/seed/frames.js-3/1146/600",
  "https://picsum.photos/seed/frames.js-4/1146/600",
];

const photoText = [
  "Leave a message",
  "Yo, please leave a message",
  "To view book, leave a message",
  "Thanks!",
  "Here book",
];

const allMessages: string[] = [];

const initialState: State = {
  pageIndex: PageType.LeaveMessage,
  leftMessage: false,
};

const reducer: FrameReducer<State> = (state, action) => {
  const buttonIndex = action.postBody?.untrustedData.buttonIndex;

  const didUserClickSubmit = buttonIndex === 1;

  // Case: left message and clicked view book, show "ViewBookNoMessage" page
  if (state.leftMessage && !didUserClickSubmit) {
    return {
      pageIndex: PageType.ViewBookNoMessage,
      leftMessage: false,
    };
  }

  // Case: left message and clicked submit, show "ViewBookWithMessage" page
  if (state.leftMessage && didUserClickSubmit) {
    return {
      pageIndex: PageType.ViewBookWithMessage,
      leftMessage: true,
    };
  }

  // Default, show "LeaveMessage" page
  return {
    pageIndex: PageType.LeftMessage,
    leftMessage: true,
  };
};

// This is a react server component only
export default async function Home({
  params,
  searchParams,
}: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const frameMessage = await getFrameMessage(previousFrame.postBody);

  if (frameMessage && !frameMessage?.isValid) {
    throw new Error("Invalid frame payload");
  }

  const message: string | undefined = frameMessage?.inputText;

  // Case: user has left a message, record it in the guestbook
  if (message) {
    allMessages.push(message);
  }

  const bookUrl = "https://i.postimg.cc/pr8VFQ1d/Renaissance-Painting.png";

  const [state] = useFramesReducer<State>(reducer, initialState, previousFrame);

  if (frameMessage) {
    const {
      isValid,
      buttonIndex,
      inputText,
      castId,
      requesterFid,
      casterFollowsRequester,
      requesterFollowsCaster,
      likedCast,
      recastedCast,
      requesterCustodyAddress,
      requesterVerifiedAddresses,
      requesterUserData,
    } = frameMessage;
  }

  const baseUrl = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";
  const imageUrl = photoUrls[state.pageIndex - 1];

  // Case: first time viewing, show the first page
  //   if (previousFrame.postBody === null) {
  //     return (
  //       <div>
  //         Guestbook <Link href={`/debug?url=${baseUrl}`}>Debug</Link>
  //         <FrameContainer
  //           pathname="/guestBook"
  //           postUrl="/guestBook/"
  //           state={state}
  //           previousFrame={previousFrame}
  //         >
  //           <FrameImage aspectRatio="1:1">
  //             <div tw="flex flex-col">
  //               <img width={300} height={300} src={imageUrl} alt="Image" />
  //               <div tw="flex">{photoText[state.pageIndex]}</div>
  //             </div>
  //           </FrameImage>
  //           <FrameInput text="leave a message" />
  //           <FrameButton>Submit</FrameButton>
  //           <FrameButton>View Guest Book</FrameButton>
  //         </FrameContainer>
  //       </div>
  //     );
  //   }

  // then, when done, return next frame
  return (
    <div>
      Guestbook <Link href={`/debug?url=${baseUrl}`}>Debug</Link>
      <FrameContainer
        pathname="/guestBook"
        postUrl={`${baseUrl}/guestBook/frames`}
        state={state}
        previousFrame={previousFrame}
      >
        <FrameImage aspectRatio="1:1">
          <div tw="flex flex-col">
            <img height="1000" width="1000" src={bookUrl} alt="Image" />
          </div>
        </FrameImage>
        <FrameInput text="leave a message" />
        <FrameButton>Submit</FrameButton>
        <FrameButton>View Guest Book</FrameButton>
      </FrameContainer>
    </div>
  );
}
