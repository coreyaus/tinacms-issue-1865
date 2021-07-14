
import dynamic from "next/dynamic";

import { EditProvider, setEditing, useEditState } from "tina-graphql-gateway";

// InnerApp that handles rendering edit mode or not
function InnerApp({ Component, pageProps }) {
  const { edit } = useEditState();
  if (edit && pageProps.query) {
    // Dynamically load Tina only when in edit mode so it does not affect production
    // see https://nextjs.org/docs/advanced-features/dynamic-import#basic-usage
    const TinaWrapper = dynamic(() => import("../components/tina-wrapper"));
    return (
      <>
        <TinaWrapper {...pageProps}>
          {(props) => <Component {...props} />}
        </TinaWrapper>
      </>
    );
  }
  return <Component {...pageProps} />;
}

// Our app is wrapped with edit provider
function App(props) {
  return (
    <EditProvider>
      <ToggleButton />
      <InnerApp {...props} />
    </EditProvider>
  );
}
const ToggleButton = () => {
  const { edit, setEdit } = useEditState();
  return (
    <button
      onClick={() => {
        setEdit(!edit);
      }}
    >
      Toggle Edit State
    </button>
  );
};

export default App;