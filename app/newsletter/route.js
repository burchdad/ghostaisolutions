// 302 redirect to your public Buttondown page
export async function GET() {
  return Response.redirect("https://buttondown.com/burch", 302);
}
