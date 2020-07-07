import { requestPostSave } from "@factor/post/request"
import { addPostType, addFilter } from "@factor/api"
import { sendEmailRequest } from "@factor/email"
import { setting } from "@factor/api/settings"
import { FactorPostState } from "@factor/post/types"
import { dotSetting } from "@factor/api/utils";
import { timeUtil } from "@factor/api"


const postType = "submission"

export const interpolate = (string: string, values: Record<string, any>) => {
  return string.replace(/\${\s*([\w\.]+[\w]+)\s*}/g, (match, key) => {
    let value = dotSetting({ key, settings: values });
    if (!value) {
      console.log(`No value found for key "${key}"`)
    }
    return value || "";
  });
}

export const sendFormEmail = async (to: string, title: string, content: string, vars: Record<string, any>) => {

  vars = {
    page: {
      title: document.title,
      url: window.location.href
    },
    app: {
      name: setting("app.name"),
      url: setting("app.url")
    },
    datetime: timeUtil().format("dddd DD. MMMM YYYY mm:HH"),
    ...vars
  }

  let config: Record<string, string> = {
    to,
    title,
    subject: title,
    text: `<div style="margin: 2rem 0 2rem 0;">${content}</div>`,
    linkText: setting("form.email.meta.linkText"),
    linkUrl: setting("form.email.meta.linkUrl"),
    textFooter: setting("form.email.meta.textFooter"),
  }

  for (let key in config) {
    config[key] = interpolate(config[key], vars)
  }

  config.emailId = postType

  await sendEmailRequest("sendEmail", config);
}

export const saveForm = async (
  content: string,
  values: Record<string, any>
): Promise<FactorPostState> => {
  const post = { content, settings: values }
  return await requestPostSave({ post, postType: postType })
}

export const setup = (): void => {
  addPostType({
    postType,
    nameIndex: "Form Submissions",
    nameSingle: "Submission",
    namePlural: "Form Submissions",
    noAddNew: true,
    accessLevel: 300,
    managePosts: true,
    permissions: {
      create: { accessLevel: 0 },
      retrieve: {
        accessLevel: 200,
        accessAuthor: true,
      },
    },
  })
  addFilter({
    key: "inputFields",
    hook: "ui-form-inputs",
    callback: (inputs) => {
      console.log(inputs)
      return {
        factorInputFields: () => import("./input-fields.vue"),
        ...inputs
      }
    }
  })
}

setup()