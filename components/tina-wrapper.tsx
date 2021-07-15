
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
      sidebar: true,
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

// NOTE: the recursive calls to configureFields are not needed in this
// test case but make it easy to apply the markdown editor to textarea
// fields that are nested within field group or block components.
const configureFields = (fields) => {
  fields?.forEach((field) => {
    // Iterate through all fields in a field group component
    if (field.fields) {
      configureFields(field.fields);
    }

    // Iterate through all fields in block components
    if (field.templates) {
      Object.keys(field.templates).forEach((template) => {
        configureFields(field.templates[template].fields);
      });
    }

    if (field.name == "_body" || field.name == "content") {
      field.component = "markdown";
    }
  });
};

const Inner = (props) => {
  const [payload, isLoading] = useGraphqlForms({
    query: (gql) => gql(props.query),
    variables: props.variables || {},
    formify: ({ createForm, formConfig, skip }) => {
      configureFields(formConfig.fields);
      return createForm(formConfig);
    },
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

