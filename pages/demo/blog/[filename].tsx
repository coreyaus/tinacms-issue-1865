
import { LocalClient, EditProvider } from "tina-graphql-gateway";
import type { Posts_Document } from "../../../.tina/__generated__/types";
import TinaWrapper from "../../../components/tina-wrapper";

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

// Use the props returned by get static props (this can be deleted when the edit provider and tina-wrapper are moved to _app.js)

const BlogPage = (props: AsyncReturnType<typeof getStaticProps>["props"]) => {
  return (
    <div>
      <div
        style={{
          textAlign: "center",
        }}
      >
        <h1>{props.data.getPostsDocument.data.title}</h1>
        <div>{props.data.getPostsDocument.data._body}</div>
      </div>
      {/* you can delete this iframe (and page) once you are done getting started */}
      <iframe style={{height: "80vh", width: "100%", border: "none"}} src="https://tina.io/docs/tina-init-tutorial/?layout=false"></iframe>
    </div>
  );
};

export const query = `#graphql
  query BlogPostQuery($relativePath: String!) {
    getPostsDocument(relativePath: $relativePath) {
      data {
        __typename
        ... on  Article_Doc_Data{
          title
          _body
        }
      }
    }
  }
`;

const client = new LocalClient();

export const getStaticProps = async ({ params }) => {
  const variables = { relativePath: `${params.filename}.md` };
  return {
    props: {
      data: await client.request<{ getPostsDocument: Posts_Document }>(query, {
        variables,
      }),
      variables,
      query,
    },
  };
};

/**
 * To build the blog post pages we just iterate through the list of
 * posts and provide their "filename" as part of the URL path
 *
 * So a blog post at "content/posts/hello.md" would
 * be viewable at http://localhost:3000/posts/hello
 */
export const getStaticPaths = async () => {
  const postsListData = await client.request<{
    getPostsList: Posts_Document[];
  }>(
    (gql) => gql`
      {
        getPostsList {
          sys {
            filename
          }
        }
      }
    `,
    { variables: {} }
  );
  return {
    paths: postsListData.getPostsList.map((post) => ({
      params: { filename: post.sys.filename },
    })),
    fallback: false,
  };
};
export default BlogPage
