import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        tracks: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error(`Error fetching category ${params.slug}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { title, description, coverUrl, newSlug } = body;

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { slug },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // If changing slug, check if new slug is already in use
    if (newSlug && newSlug !== slug) {
      const slugExists = await prisma.category.findUnique({
        where: { slug: newSlug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug is already in use' },
          { status: 400 }
        );
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { slug },
      data: {
        title,
        description,
        coverUrl,
        slug: newSlug || slug, // Update slug if provided
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { slug },
      include: {
        tracks: true,
      },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has tracks
    if (categoryExists.tracks.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with tracks. Delete or move tracks first.' },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { slug },
    });

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}