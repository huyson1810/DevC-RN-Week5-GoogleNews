import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Linking } from 'react-native';
import moment from 'moment';
import { Card, Button , Icon} from 'react-native-elements';
import { FlatList } from 'react-native';


const filterForUniqueArticles = arr => {
  const cleaned = [];
  arr.forEach(itm => {
    let unique = true;
    cleaned.forEach(itm2 => {
      const isEqual = JSON.stringify(itm) === JSON.stringify(itm2);
      if (isEqual) unique = false;
    });
    if (unique) cleaned.push(itm);
  });
  return cleaned;
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasErrored, setHasApiError] = useState(false);
  const [lastPageReached, setLastPageReached] = useState(false);

  const getNews = async () => {
    if (lastPageReached) return;

    setLoading(true);
    try {
      console.log('get news');
      const response = await fetch(
        'https://newsapi.org/v2/top-headlines?country=us&apiKey=8c41ba8fb6ee9d396d67d87d458ca196'
      );

      const jsonData = await response.json();

      const hasMoreArticles = jsonData.articles.length > 0;

      if (hasMoreArticles) {
        const newArticleList = filterForUniqueArticles(
          articles.concat(jsonData.articles)
      );
        setArticles(newArticleList);
        setPageNumber(pageNumber + 1);
      } else {
        setLastPageReached(true);
      }
    } catch (error) {
      setHasApiError(true);
    }  
    setLoading(false);
  };

  useEffect( () => {
    getNews()
  }, [articles]);

  if (hasErrored) {
    return (
      <View style={styles.container}>
        <Text>Error :((( </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" loading={loading} color="black" />
      </View>
    )
  }

  const onPress = url => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log(`Don't know how to open URL: ${url}`);
      }
    });
  };

  const renderArticleItem = ({ item }) => {
    // console.log('item title: ', item.title);
    return (
      <Card title={item.title} image={{ uri: item.urlToImage }}>
        <View style={styles.row}>
          <Text style={styles.label}>Source</Text>
          <Text style={styles.info}>{item.source.name}</Text>
        </View>
        <Text style={{ marginBottom: 10 }}>{item.content}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Published</Text>
          <Text style={styles.info}>
            {moment(item.publishedAt).format('LLL')}
          </Text>
        </View>
        <Button icon={<Icon />} title="Read more" backgroundColor="#03A9F4" 
                onPress = {() => onPress(item.url)}
        />
      </Card>
    );
  };


  return (
    <View style={styles.container}>
      {/* { articles.map(article => {
          return (
            <Card 
              title={article.title} 
              image={{ uri: article.urlToImage }}
              >
              <View style={styles.row}>
                <Text style={styles.label}>Source</Text>
                <Text style={styles.info}>{article.source.name}</Text>
              </View>
              <Text style={{ marginBottom: 10 }}>{article.content}</Text>
              <View style={styles.row}>
                <Text style={styles.label}>Published</Text>
                <Text style={styles.info}>
                  {moment(article.publishedAt).format('LLL')}
                </Text>
              </View>
              <Button icon={<Icon />} title="Read more" backgroundColor="#03A9F4" />
            </Card>
          )
        })
      }   */}

      <View style={styles.row}>
        <Text style={styles.label}>Articles Count:</Text>
        <Text style={styles.info}>{articles.length}</Text>
      </View>

      <FlatList
        data={articles}
        onEndReached={getNews}
        onEndReachedThreshold={1}
        renderItem={renderArticleItem}
        keyExtractor={item => item && item.title}

        ListFooterComponent={ 
          lastPageReached ? <Text>No more Articles</Text>
                          : <ActivityIndicator size="large" loading={loading} color="black" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  containerFlex: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: '#fff',
    justifyContent: 'flex-start'
  },
  header: {
    height: 30,
    width: '100%',
    backgroundColor: 'pink'
  },
  row: {
    flexDirection: 'row'
  },
  label: {
    fontSize: 16,
    color: 'black',
    marginRight: 10,
    fontWeight: 'bold'
  },
  info: {
    fontSize: 16,
    color: '#03A9F4'
  }
});
