import cloudinary
import cloudinary.uploader
import os

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB


async def upload_image(file, folder: str = "birthday-site") -> str:
    """Upload a file to Cloudinary and return the secure URL."""
    if file.content_type not in ALLOWED_TYPES:
        raise ValueError("Only JPEG, PNG, GIF, or WebP images are allowed")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise ValueError("Image must be under 10 MB")

    result = cloudinary.uploader.upload(
        contents,
        folder=folder,
        resource_type="image",
        transformation=[
            {"quality": "auto", "fetch_format": "auto"},
        ],
    )
    return result["secure_url"]


def delete_image(public_id: str):
    """Delete an image from Cloudinary by public_id."""
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception:
        pass


def get_public_id(url: str) -> str:
    """Extract public_id from a Cloudinary URL."""
    # e.g. https://res.cloudinary.com/cloud/image/upload/v123/birthday-site/abc.jpg
    # public_id = birthday-site/abc
    try:
        parts = url.split("/upload/")
        if len(parts) < 2:
            return ""
        after_upload = parts[1]
        # remove version prefix if present (v1234567/)
        if after_upload.startswith("v") and "/" in after_upload:
            after_upload = after_upload.split("/", 1)[1]
        # remove extension
        public_id = after_upload.rsplit(".", 1)[0]
        return public_id
    except Exception:
        return ""