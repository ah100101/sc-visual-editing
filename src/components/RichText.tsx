import React from "react";
import {
  Field,
  RichText as JssRichText,
  useSitecoreContext,
} from "@sitecore-jss/sitecore-jss-nextjs";
import {
  encodeVisualEditingInfo,
  visualEditingEnabled,
} from "lib/visual-editing";

interface Fields {
  Text: Field<string>;
}

export type RichTextProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: RichTextProps): JSX.Element => {
  if (visualEditingEnabled()) {
    const { sitecoreContext } = useSitecoreContext();
    props.fields.Text.value = encodeVisualEditingInfo(
      props.fields.Text.value,
      sitecoreContext
    );
  }

  const text = props.fields ? (
    <JssRichText field={props.fields.Text} />
  ) : (
    <span className="is-empty-hint">Rich text</span>
  );
  const id = props.params.RenderingIdentifier;

  return (
    <div
      className={`component rich-text ${props.params.styles.trimEnd()}`}
      id={id ? id : undefined}
    >
      <div className="component-content">{text}</div>
    </div>
  );
};
