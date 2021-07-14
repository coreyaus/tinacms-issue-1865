
import { TinaCloudProvider, useGraphqlForms } from "tina-graphql-gateway";
import { useMemo } from "react";
import { TinaCMS } from "tinacms";
import { LocalClient } from "tina-graphql-gateway";
import { MarkdownFieldPlugin } from "react-tinacms-editor";

const TinaWrapper = (props) => {
  const cms = useMemo(() => {
    return new TinaCMS({
      apis: {
        tina: new LocalClient(),
      },
      plugins: [MarkdownFieldPlugin],
      enabled: true,
    });
  }, []);

  return (
    <TinaCloudProvider
      cms={cms}
      clientId={process.env.NEXT_PUBLIC_TINA_CLIENT_ID}
      branch={process.env.NEXT_PUBLIC_EDIT_BRACH}
      organization={process.env.NEXT_PUBLIC_ORGANIZATION_NAME}
      isLocalClient={Boolean(
        Number(process.env.NEXT_PUBLIC_USE_LOCAL_CLIENT ?? true)
      )}
    >
      <Inner {...props} />
    </TinaCloudProvider>
  );
};

const Inner = (props) => {
  const [payload, isLoading] = useGraphqlForms({
    query: (gql) => gql(props.query),
    variables: props.variables || {},
  });
  return (
    <>
      {isLoading ? (
        <>
          <div>Loading</div>
          <div
            style={{
              pointerEvents: "none",
            }}
          >
            {props.children(props)}
          </div>
        </>
      ) : (
        // pass the new edit state data to the child
        props.children({ ...props, data: payload })
      )}
    </>
  );
};

export default TinaWrapper;

