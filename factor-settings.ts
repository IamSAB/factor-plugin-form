export default {
  form: {
    fields: {
      email: {
        label: "Email *",
      description:
        "Provide your email. You'll receive a confirmation of your submission.",
      placeholder: "your-email@provider.com"
      },
      default: [
        {
          _id: "name",
          input: "text",
          label: "Vorname und Nachname",
          description: "Wie du angesprochen wirst",
          required: true
        },
        {
          _id: "email",
          input: "email",
          label: "Email",
          description:
            "Bestätigung deiner Einreichung wird an diese Adresse versendet.",
          required: true
        },
        {
          _id: "message",
          input: "editor",
          label: "Nachricht",
          description: "Was liegt dir auf dem Herzen?",
          required: true
        }
      ],
      render: {
        editor: (): Promise<any> => import("./render/editor.vue"),
        tags: (): Promise<any> => import("./render/tags.vue"),
        sortable: (): Promise<any> => import("./render/sortable.vue"),
      },
    },
    email: {
      render: (): Promise<any> => import("./render/fields.vue"),
      title: "Form Submission on ${page.url} with ${email}",
      notifyTo: "${email}",
      meta: {
        linkText: "Provided input of the form on website ${page.title}",
        linkUrl: "${page.url}",
        textFooter: "This email was automatically generated and send on ${datetime} due to a form submission on ${app.name}."
      }
    },
  }
}