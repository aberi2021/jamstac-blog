import { GetStaticPaths, GetStaticProps } from 'next'
import { NextSeo } from 'next-seo'
import styled from 'styled-components'
import type { NextPageWithLayout } from '@/pages/_app'
import DefaultLayout from '@/components/layout/default-layout'
import { client } from '@/lib/client'
import Image from 'next/image'
import Button from '@/components/atoms/button'
import Link from 'next/link'
import BreadCrumbs from '@/components/molecules/breadcrumb'

type Props = {
  data: {
    content: string
    createdAt: string
    eyecatch?: {
      url: string
      height: number
      width: number
    }
    id: string
    publishedAt: string
    revisedAt: string
    title: string
    updatedAt: string
  }
  prevPost: {
    id: string
    title: string
  } | null
  nextPost: {
    id: string
    title: string
  } | null
}

const BlogDetail: NextPageWithLayout<Props> = (props) => {
  const { title, content, eyecatch } = props.data
  const { prevPost, nextPost } = props

  return (
    <>
      <NextSeo title={`${title} | あべのサイト`} />
      <BlogPage>
        <BreadCrumbs
          lists={[
            {
              string: 'トップページ',
              path: '/',
            },
            {
              string: title, // タイトルを表示する
              path: '', // path プロパティを追加し、空文字列を指定
            },
          ]}
        />
        <BlogTitle>{title}</BlogTitle>
        {eyecatch && (
          <Image
            src={eyecatch.url}
            width={eyecatch.width}
            height={eyecatch.height}
            alt={''}
          />
        )}
        <ContentsWrapper>
          <div dangerouslySetInnerHTML={{ __html: content }}></div>
        </ContentsWrapper>
        {prevPost && (
          <Link href={`/blogs/${prevPost.id}`}>前の記事（{prevPost.title}</Link>
        )}
        {nextPost && (
          <Link href={`/blogs/${nextPost.id}`}>次の記事（{nextPost.title}</Link>
        )}
        <Button href={'/'} label={'トップへ戻る'} />
      </BlogPage>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const res = await client.get({ endpoint: 'blogs', queries: { limit: 1000 } })

  const paths = res.contents.map((post: { id: string }) => ({
    params: { id: post.id },
  }))

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<Props> = async (context) => {
  const id = context.params?.id as string
  const res = await client.get({ endpoint: 'blogs', contentId: id })

  // 全ての記事を取得する
  const resAllPosts = await client.get({ endpoint: 'blogs' })
  const allPosts = resAllPosts.contents

  // 現在の記事のインデックスを取得
  const currentIndex = allPosts.findIndex(
    (post: { id: string }) => post.id === id
  )

  // 前の記事と次の記事を取得
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const nextPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null

  return {
    props: {
      data: res,
      prevPost,
      nextPost,
    },
  }
}

BlogDetail.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>

const BlogPage = styled.div`
  margin-top: 1rem;
  max-width: 47rem;
  margin: 0 auto;
  padding: 1rem;
`

const BlogTitle = styled.h2`
  font-size: 2rem;
`

const ContentsWrapper = styled.div`
  margin-top: 1rem;
  pre,
  code {
    background-color: #000;
    color: #fff;
    font-size: 1rem;
  }
  pre {
    padding: 1rem;
    margin-top: 1rem;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow: auto;
  }
  p > code {
    padding: 0 0.5rem;
  }
`

export default BlogDetail
