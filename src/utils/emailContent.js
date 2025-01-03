export const EmailType = {
  Welcome: "welcome",
  ResetPassword: "resetPassword",
};

export const emailContent = {
  [EmailType.Welcome]: {
    subject: "Welcome to our platform",
    html: `
      <html>
    <head>
    <title>Bem-vindo à Delight</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #fafad2; /* Amarelo claro */
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff; /* Branco */
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #fafad2; /* Amarelo claro */
            color: #333333; /* Cinza escuro */
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
        }
        .header p {
            margin: 5px 0 0;
            font-size: 16px;
        }
        .body {
            padding: 20px;
            color: #333333; /* Texto em cinza escuro */
        }
        .body img {
            width: 100%;
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
        }
        .body p {
            margin: 15px 0;
            line-height: 1.6;
            font-size: 16px;
        }
        .body .button {
            text-align: center;
            margin: 20px 0;
        }
        .body .button a {
            display: inline-block;
            padding: 15px 30px;
            background-color: #fafad2; /* Amarelo claro */
            color: #333333; /* Cinza escuro */
            text-decoration: none;
            border: 1px solid #333333;
            border-radius: 5px;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        .body .button a:hover {
            background-color: #f5e79e; /* Amarelo mais forte */
        }
        .footer {
            background-color: #fafad2; /* Amarelo claro */
            color: #333333; /* Texto em cinza escuro */
            text-align: center;
            padding: 20px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bem-vindo à Delight</h1>
            <p>Seu parceiro na busca pelo imóvel dos sonhos!</p>
        </div>
        <div class="body">
            <p>Olá,</p>
            <p>Obrigado por se registrar na Delight Imóveis! Estamos aqui para ajudar você a encontrar o lugar perfeito para chamar de lar.</p>
            <p>Aqui estão algumas opções para começar:</p>
            <div class="button">
                <a href="http://localhost:3000/home">Explore Nossos Imóveis</a>
            </div>
            <img src="https://picsum.photos/id/1056/600/200" alt="Imagem de Imóveis" style="display: block; width: 100%; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <p>Se precisar de ajuda ou informações adicionais, nossa equipe está à disposição para ajudar.</p>
        </div>
        <div class="footer">
            <p>Atenciosamente,<br>Equipe Delight</p>
        </div>
    </div>
</body>
</html>
    `,
  },
  [EmailType.ResetPassword]: {
    subject: "Reset your password",
    html: (token) => `
      <html>
<body style="font-family: Arial, sans-serif; background-color: #f2f2f2; margin: 0; padding: 0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f2f2f2; margin: 0; padding: 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <img src="https://picsum.photos/600/200" alt="Logo" style="display: block; width: 100%; border-top-left-radius: 8px; border-top-right-radius: 8px;">
              <h1 style="color: #333333; margin: 20px 0; font-size: 28px;">Redefinir sua senha</h1>
              <p style="color: #666666; margin: 15px 0; font-size: 16px; line-height: 1.6;">Olá,</p>
              <p style="color: #666666; margin: 15px 0; font-size: 16px; line-height: 1.6;">Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para continuar:</p>
              <p style="margin: 30px 0;">
                <a href="{{RESET_LINK}}" style="display: inline-block; padding: 15px 35px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 25px; font-size: 18px; transition: background-color 0.3s ease;">Redefinir Senha</a>
              </p>
              <p style="color: #666666; margin: 15px 0; font-size: 14px; line-height: 1.6;">Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:</p>
              <p style="color: #007bff; margin: 10px 0; font-size: 14px; word-break: break-word;"><a href="{{RESET_LINK}}" style="color: #007bff; text-decoration: none;">{{RESET_LINK}}</a></p>
              <p style="color: #999999; margin: 30px 0; font-size: 12px;">Se você não solicitou essa redefinição, ignore este e-mail.</p>
              <p style="color: #999999; padding: 20px 0; font-size: 14px;">Atenciosamente,<br>Equipe Delight</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  },
};
