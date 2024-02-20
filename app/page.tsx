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
import { DEBUG_HUB_OPTIONS } from "./debug/constants";

enum PageType {
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
export default function Home({ params, searchParams }: NextServerPageProps) {
  const previousFrame = getPreviousFrame<State>(searchParams);

  const bookUrl = "https://i.postimg.cc/pr8VFQ1d/Renaissance-Painting.png";

  const [state] = useFramesReducer<State>(reducer, initialState, previousFrame);

  const baseUrl = process.env.NEXT_PUBLIC_HOST || "http://localhost:3000";

  // then, when done, return next frame
  return (
    <div>
      Guestbook <Link href={`/debug?url=${baseUrl}`}>Debug</Link>
      <FrameContainer
        pathname="/"
        postUrl={`${baseUrl}/frames`}
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
